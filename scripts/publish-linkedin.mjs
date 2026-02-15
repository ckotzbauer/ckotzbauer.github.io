#!/usr/bin/env node

/**
 * LinkedIn Post Publisher
 *
 * This script reads markdown files from the linkedin/ directory and publishes
 * them to LinkedIn via a webhook endpoint (e.g., Zapier, Buffer, Make.com).
 *
 * Posts are published when:
 * - pubDate is in the past or present
 * - published is false
 *
 * After successful publishing, the published flag is set to true.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LINKEDIN_DIR = path.join(__dirname, "..", "linkedin");
const WEBHOOK_URL = process.env.LINKEDIN_WEBHOOK_URL;

// Parse frontmatter from markdown content
function parseFrontmatter(content) {
  const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
  const match = content.match(frontmatterRegex);

  if (!match) {
    return null;
  }

  const frontmatterStr = match[1];
  const body = match[2];

  const frontmatter = {};
  const lines = frontmatterStr.split("\n");

  for (const line of lines) {
    const colonIndex = line.indexOf(":");
    if (colonIndex > 0) {
      const key = line.slice(0, colonIndex).trim();
      let value = line.slice(colonIndex + 1).trim();

      // Parse boolean values
      if (value === "true") value = true;
      else if (value === "false") value = false;
      // Parse dates
      else if (key === "pubDate" && value) {
        value = new Date(value);
      }

      frontmatter[key] = value;
    }
  }

  return { frontmatter, body };
}

// Convert markdown body to plain text (basic conversion)
function markdownToPlainText(markdown) {
  return (
    markdown
      // Remove headers
      .replace(/^#+\s+.*$/gm, "")
      // Remove bold/italic
      .replace(/[*_]{1,3}([^*_]+)[*_]{1,3}/g, "$1")
      // Remove links but keep text
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      // Remove images
      .replace(/!\[([^\]]*)\]\([^)]+\)/g, "")
      // Remove code blocks
      .replace(/```[\s\S]*?```/g, "")
      // Remove inline code
      .replace(/`([^`]+)`/g, "$1")
      // Remove list markers
      .replace(/^[\s]*[-*+]\s+/gm, "")
      .replace(/^[\s]*\d+\.\s+/gm, "")
      // Clean up extra whitespace
      .replace(/\n{3,}/g, "\n\n")
      .trim()
  );
}

// Update frontmatter in file
function updateFrontmatter(filePath, frontmatter, body) {
  const newFrontmatter = { ...frontmatter, published: true };

  let frontmatterStr = "---\n";
  for (const [key, value] of Object.entries(newFrontmatter)) {
    if (value instanceof Date) {
      frontmatterStr += `${key}: ${value.toISOString()}\n`;
    } else if (typeof value === "boolean") {
      frontmatterStr += `${key}: ${value}\n`;
    } else {
      frontmatterStr += `${key}: ${value}\n`;
    }
  }
  frontmatterStr += "---\n";

  const newContent = frontmatterStr + body;
  fs.writeFileSync(filePath, newContent, "utf-8");
}

// Publish post via webhook
async function publishPost(title, content) {
  if (!WEBHOOK_URL) {
    console.log("⚠️  LINKEDIN_WEBHOOK_URL not set, skipping actual publish");
    return { success: true, simulated: true };
  }

  try {
    const response = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: title,
        content: content,
        timestamp: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      throw new Error(
        `Webhook returned ${response.status}: ${response.statusText}`,
      );
    }

    return { success: true, simulated: false };
  } catch (error) {
    console.error(`❌ Failed to publish: ${error.message}`);
    return { success: false, error: error.message };
  }
}

// Main function
async function main() {
  console.log("🔍 Checking for LinkedIn posts to publish...\n");

  // Check if linkedin directory exists
  if (!fs.existsSync(LINKEDIN_DIR)) {
    console.log("📁 LinkedIn directory does not exist, creating it...");
    fs.mkdirSync(LINKEDIN_DIR, { recursive: true });
    return;
  }

  // Get all markdown files
  const files = fs.readdirSync(LINKEDIN_DIR).filter((f) => f.endsWith(".md"));

  if (files.length === 0) {
    console.log("📭 No LinkedIn posts found.");
    return;
  }

  const now = new Date();
  let publishedCount = 0;
  let pendingCount = 0;

  for (const file of files) {
    const filePath = path.join(LINKEDIN_DIR, file);
    const content = fs.readFileSync(filePath, "utf-8");
    const parsed = parseFrontmatter(content);

    if (!parsed) {
      console.log(`⚠️  ${file}: Invalid frontmatter, skipping`);
      continue;
    }

    const { frontmatter, body } = parsed;
    const { title, pubDate, published } = frontmatter;

    // Check if post should be published
    if (published) {
      console.log(`✅ ${file}: Already published`);
      continue;
    }

    if (!pubDate) {
      console.log(`⚠️  ${file}: No pubDate set, skipping`);
      continue;
    }

    if (pubDate > now) {
      const diff = pubDate - now;
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      console.log(
        `⏳ ${file}: Scheduled for ${pubDate.toISOString()} (in ${hours}h ${minutes}m)`,
      );
      pendingCount++;
      continue;
    }

    // Publish the post
    console.log(`📤 ${file}: Publishing "${title}"...`);
    const plainText = markdownToPlainText(body);
    const result = await publishPost(title, plainText);

    if (result.success) {
      updateFrontmatter(filePath, frontmatter, body);
      console.log(
        `✅ ${file}: Published successfully${result.simulated ? " (simulated)" : ""}`,
      );
      publishedCount++;
    }
  }

  console.log(
    `\n📊 Summary: ${publishedCount} published, ${pendingCount} pending`,
  );
}

main().catch(console.error);
