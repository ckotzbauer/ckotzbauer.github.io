---
title: Migrating from Durandal to Aurelia
published: 2016-06-15T10:00:00Z
description: "Migration guide to switch from Durandal to Aurelia framework."
image: ""
tags: [Aurelia, SPA, Web]
category: "Development"
draft: false
lang: "en"
---

# Migrating from Durandal to Aurelia

If you have an existing Durandal application you maybe want to migrate this app to Aurelia. Typically you used

Knockout for data-binding. Because Aurelia brings its own data-binding language the usage of Knockout

is not necessary anymore. But probably especially this part of the migration requires the greatest effort,

because you have to modify much of your code or partially rewrite it. So let's split this effort as much as possible:

Here's a way how you can use Aurelia side-by-side with the Knockout technology and then migrate each view and

view-model step-by-step. You can use your old Knockout views and their backed JavaScript code with its observables

and subscriptions, as if you were still using Durandal.

## First Steps

First, install the Aurelia plugin

```bash
jspm install aurelia-knockout
```

and register it during the startup of your app:

```js
export function configure(aurelia) => {
    aurelia.use
        .standardConfiguration()
        .developmentLogging()
        .plugin("aurelia-knockout");

    aurelia.start().then(() => aurelia.setRoot());
}
```

The next step will be, to add the `knockout` custom attribute to each view which uses Knockout syntax:

```html
<template>
  <div knockout>
    <button data-bind="click: changeVisibility">Change Visibility</button>
    <div data-bind="if: isVisible">
      <span data-bind="text: firstName"></span>
      <br />
      <span data-bind="text: lastName"></span>
    </div>
  </div>
</template>
```

**Note:** The element with the custom attribute has to wrap all code with Knockout syntax.

This attribute binds the HTML to the current BindingContext of Aurelia.

And that's it! With these small modifications you can use all Knockout bindings which are available.

## Using Compositions

Durandal also provided a binding to compose views. Because this binding was implemented from Durandal and not

from Knockout you can not use this feature natively. But the `aurelia-knockout` plugin supports the composition

with all possible variants listed in the [official Durandal docs](http://durandaljs.com/documentation/Using-Composition.html):

```html
<div data-bind="compose: 'path/to/view.html'"></div>
<div data-bind="compose: 'path/to/module'"></div>
<div data-bind="compose: { view: 'path/to/view.html' }"></div>
<div data-bind="compose: { model: 'path/to/module' }"></div>
<div data-bind="compose: { model: moduleInstance }"></div>
<div
  data-bind="compose: { view: 'path/to/view.html' model: 'path/to/module' }"
></div>
<div
  data-bind="compose: { view: 'path/to/view.html' model: moduleInstance }"
></div>
<div data-bind="compose: moduleInstance"></div>
<div data-bind="compose: moduleConstructorFunction"></div>
```

## Set @bindable properties

To enhance the flexibility of your migration process, this plugin also supports the ability to set `@bindable`

variables in rewritten subordinated Aurelia views through the activationData. This offers the possibility to rewrite

single views in lower hierarchies without the need to do the same with their parent views.

#### Parent Knockout based view

Supposed that there is a parent view using Knockout technology which composes a child view like this:

```html
<template>
  <div
    data-bind="compose: { model: 'path/to/submodule', activationData: data }"
  ></div>
</template>
```

The appropriate data object would looks like this:

```js
{
  price: ko.observable(5),
  productName: "Apples"
}
```

#### Child Aurelia based view

The child view and view-model uses Aurelia:

```html
<template>
  Product:
  <span>${productName}</span>
  <br />
  Price:
  <span>${price}</span>
</template>
```

```js
import { bindable } from "aurelia-framework";
import { inject } from "aurelia-dependency-injection";
import { KnockoutBindable } from "aurelia-knockout";

@inject(KnockoutBindable)
export class ProductView {
  @bindable
  price;
  productName;

  knockoutBindable;

  constructor(knockoutBindable) {
    this.knockoutBindable = knockoutBindable;
  }

  activate(activationData) {
    this.knockoutBindable.applyBindableValues(activationData, this);
  }
}
```

This will set the value from `activationData.price` to `this.price`. `this.productName` however, is not

updated because it has no `@bindable` decorator and the variable from `activationData` is no Knockout

observable. To process non Knockout observables anyway you have to pass `false` as third parameter to the

`applyBindableValues` function. If the outer value changed (and is an observable) the corresponding inner

variable is updated too.

Subscriptions for Knockout observables which are created from this plugin internally will be disposed automatically

if the child view is unbound.

## Conclusion

The migration to a new framework is often a big task depending on your application. But that does not mean that you have to implement it all at once. This plugin offers you a possibility to ship preliminary results during the transition phase of your application.
