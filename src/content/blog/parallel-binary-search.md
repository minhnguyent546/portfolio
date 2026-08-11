---
title: Parallel Binary Search
description: A technique that answers many binary-searchable queries at once, sharing the intermediate data instead of rebuilding it for each query.
tags:
  - binary-search
  - parallel-binary-search
author: Minh Thien Nguyen
pubDatetime: 2023-08-26
lang: en
translationOf: parallel-binary-search-vi
---

## Table of contents

## Introduction

In simple terms, parallel binary search is binary search run **in parallel** across many queries. It reuses the data already built along the way instead of rebuilding it for each search — an idea close to dynamic programming.

When a problem lets you binary-search the answer to each query on its own, answering all $Q$ queries means running the search $Q$ times, which usually times out. Parallel binary search answers the queries together and removes that repeated work.

The technique is not new, but not many articles cover it, so this one can serve as a reference for anyone who has not met it yet.

To make the idea concrete, let's look at some example problems.

## Example problems

### [CSES - New Roads Queries](https://cses.fi/problemset/task/2101/)

**Problem statement**

Byteland has $N$ cities and no roads between them at first. Every day a new road is built, $M$ roads in total. Your task is to answer $Q$ queries: find the first day on which you can travel from city $a$ to city $b$.

**Constraints**

- $1 \le N, M, Q \le 2 \cdot 10^5$
- $1 \le a, b \le N$

**Analysis**

For one query, binary search finds the first day on which $a$ and $b$ lie in the same connected component. Checking the condition with DSU, a single query costs $\mathcal{O}(M\alpha(N)\log{M})$, so all $Q$ queries cost $\mathcal{O}(QM\alpha(N)\log{M})$ — far beyond the limits.

Where is the waste? Suppose a query is searching the range $[l, r]$ and $mid = \frac{l + r}{2}$. The check builds the first $mid$ roads, and every query that reaches this $mid$ needs the same prefix of roads. Run separately, that prefix gets built over and over. So we group the queries that share a search range $[l, r]$ and answer each group at once.

Initially every query has the range $[1, M]$. After the first step the queries split into two groups: those searching $[1, M/2]$ and those searching $[M/2, M]$. After the second step there are four groups: $[1, M/4]$, $[M/4, M/2]$, $[M/2, 3M/4]$, $[3M/4, M]$. After $\log{M}$ steps every query has a range holding a single point — its answer. The cost drops from $\mathcal{O}(QM\alpha(N)\log{M})$ to $\mathcal{O}((Q + M)\alpha(N)\log{M})$.

One way to picture the process is a walk down a binary tree. All queries start at the root with the range $[1, M]$. A query whose answer lies in $[1, mid]$ moves to the left child; the others move to the right child. The search is the queries walking from the root down to their leaves.

The technique has two implementations. Here is pseudocode for both, where $T$ is a data structure that applies updates and answers queries:

**Pseudocode (recursive)**

```
parallel_binary_search(L, R, candidates):
    if L == R:
        the answer of all queries in candidates is L
        return
     mid = (L + R) / 2
     add events in [L, mid] to T
     split candidates into two groups, left(fulfilled) and right(not fulfilled)
     remove events in [L, mid] from T
     parallel_binary_search(L, mid, left)
     parallel_binary_search(mid + 1, R, right)
```

**Pseudocode (iterative)**

```
for all logM steps:
    for i in [1, queries.len]:
        if left[i] < right[i]:
            mid = (left[i] + right[i]) / 2
            insert i into candidates[mid]
    for mid in [1, events.len]:
        add events[mid] to T
        # now, all events[1..mid] have already applied
        for cand in candidates[mid]:
            if cand has requirements fulfilled:
                right[cand] = mid
            else:
                left[cand] = mid + 1
        clear all cands from candidates[mid]
    remove all events from T
```

Which one to pick depends on the problem and its data structure. Here we use DSU, which cannot undo an edge once it is added, so the iterative version is the right choice.

**Sample implementation**

<details class="spoiler">
<summary>Code</summary>

```cpp
#include <bits/stdc++.h>
using namespace std;

struct Dsu {
    int n;
    vector<int> par, sz;
    Dsu() {}
    Dsu(int _n): n(_n), par(n), sz(n) {
        init();
    }
    void init() {
        for (int i = 0; i < n; ++i) {
            par[i] = i;
            sz[i] = 1;
        }
    }
    int find(int v) {
        while (v != par[v]) {
            v = par[v] = par[par[v]];
        }
        return v;
    }
    bool same(int u, int v) {
        return find(u) == find(v);
    }
    bool unite(int u, int v) {
        u = find(u);
        v = find(v);
        if (u == v) return false;
        if (sz[u] < sz[v]) swap(u, v);
        par[v] = u;
        sz[u] += sz[v];
        return true;
    }
};

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    int n, m, q;
    cin >> n >> m >> q;
    vector<array<int, 2>> edges(m);
    for (int i = 0; i < m; ++i) {
        cin >> edges[i][0] >> edges[i][1];
        --edges[i][0];
        --edges[i][1];
    }
    vector<array<int, 2>> qs(q);
    for (int i = 0; i < q; ++i) {
        cin >> qs[i][0] >> qs[i][1];
        --qs[i][0];
        --qs[i][1];
    }
    vector<int> left(q, 0), right(q, m + 1);
    vector<vector<int>> candidates(m + 1);
    Dsu dsu(n);
    while (true) {
        bool any = false;
        for (int i = 0; i < q; ++i) {
            if (left[i] < right[i]) {
                int mid = (left[i] + right[i]) >> 1;
                candidates[mid].push_back(i);
                any = true;
            }
        }
        if (!any) break;
        for (int mid = 0; mid <= m; ++mid) {
            if (mid > 0) {
                dsu.unite(edges[mid - 1][0], edges[mid - 1][1]);
            }
            for (int idx : candidates[mid]) {
                if (dsu.same(qs[idx][0], qs[idx][1])) {
                    right[idx] = mid;
                }
                else {
                    left[idx] = mid + 1;
                }
            }
            candidates[mid].clear();
        }
        dsu.init();
    }
    for (int i = 0; i < q; ++i) {
        cout << (left[i] <= m ? left[i] : -1) << '\n';
    }
    return 0;
}
```

</details>

**Complexity**

- This implementation costs $\mathcal{O}((Q + M)\alpha(N)\log{M})$.
- Here $\alpha(N)$ is the [inverse Ackermann function](https://en.wikipedia.org/wiki/Ackermann_function#Inverse) — the cost of one DSU operation.
