---
title: Managing K8s Authorization like charm
published: 2020-06-13T10:00:00Z
description: "Kubernetes authorization for teams."
image: ""
tags: [Kubernetes, DevOps, Auth]
category: "DevOps"
draft: false
lang: "en"
---

# Managing K8s Authorization like charm

Administrating complex authorization scenarios with fine-grained permissions is often difficult. In the Kubernetes ecosystem, the "Role-based-Access-Control" (RBAC) pattern is often used to do authorization for different users and groups in your cluster. RBAC is very powerful, but gets complex if you want to grant permissions on a namespace-basis.

At work I faced this challange and wanted to simplify the definiton, creation and removal of those rules. The result of this simplification is the " [access-manager](https://github.com/ckotzbauer/access-manager)", a Kubernetes-Operator I built to manage `RoleBinding` and `ClusterRoleBinding`s. These two objects are used to assign permissions defined in `Role`s and `ClusterRole`s to accounts (Users, Groups, ServiceAccounts). And this assignment is often the complex part.

## Example

Let's start with an example, to make it more descriptive:

Given you have the following namespaces in Kubernetes:

- ci-service
- product-a
- product-b
- monitoring

And you have the following individuals or groups in your cluster:

- Jane
- John
- Support (a group of user)
- The ci-service solution

Jane is an administrator and needs access to all namespaces. John needs write-access to `product-a` and `product-b`. The support-group has to view (read-only) the two products and the `monitoring` namespace. As last requirement, the `ServiceAccount` of `ci-service` should be able to deploy new versions of the two products. For simplicity the `Role`s and `ClusterRole`s are already defined and the John and the CI should use the same role.

This scenario would end up in

- one `ClusterRoleBinding`, where `Jane` is assigned to the `cluster-admin` role,
- one `RoleBinding` in the two product namespaces, which assignes the User `John` and the `ci-service` ServiceAccount to manage the products,
- one `RoleBinding` in the two product namespaces and the `monitoring` namespace for the support-group.

So six `(Cluster-)RoleBinding`s are needed to achieve this. And the setup has to grow, if there would be a `product-c` namespace some day.

Let's get the operator into play and define the above:

```yaml
apiVersion: access-manager.io/v1beta1
kind: RbacDefinition
metadata:
  name: my-definition
spec:
  namespaced:
    - namespaceSelector:
        matchLabels:
          management: "true"
      bindings:
        - roleName: product-write-permission
          kind: ClusterRole
          subjects:
            - name: ci-service
              kind: ServiceAccount
            - name: john
              kind: User
    - namespaceSelector:
        matchLabels:
          support: "true"
      bindings:
        - roleName: support-permission
          kind: ClusterRole
          subjects:
            - name: support
              kind: Group
  cluster:
    - name: jane-admin
      clusterRoleName: cluster-admin
      subjects:
        - name: jane
          kind: User
```

I introduced two different labels on namespaces: All namespaces labeled with `management: true` are eligible to be managed from John and through the `ci-service`. All namespaced which should be viewed from the support-group are labeled with `support: true`. If there would be a `namespace-c` some day, all you have to do is, to add the needed labels. The operator will do the rest for you. Changes to namespaces or these `RbacDefinition`s are automatically detected and the desired state is applied.

For more detailed informations for the definition and other features, please read the [api-docs](https://github.com/ckotzbauer/access-manager/blob/master/docs/api.md).

## Conclusion

Role-based authorization in Kubernetes becomes more complex as the cluster grows and more different accounts getting access. With the "access-manager" it is possible to just define the Roles needed and the the assignment-rules to accounts. The creation, modification and removal of the concrete Bindings is fully managed and nothing you have to care about.
