---
title: Parallel Binary Search
description: A technique for answering multiple queries simultaneously with parallel binary search, reusing intermediate data instead of rebuilding it from scratch for each query.
tags:
  - binary-search
  - parallel-binary-search
topic: algorithms
author: Minh Thien Nguyen
pubDatetime: 2023-08-26
lang: en
translationOf: parallel-binary-search-vi
thumbnail: ./parallel-binary-search/thumbnail.svg
---

## Table of contents

## Introduction

Simply put, parallel binary search is running binary search **in parallel** and reusing previously built data instead of rebuilding it multiple times (an idea quite similar to dynamic programming).

Typically, in problems where we can binary search for the answer to each query independently, answering all $Q$ queries requires running binary search $Q$ times (which usually results in TLE). Parallel binary search helps reduce the complexity of this search.

This is not a new technique, but I have noticed there are still relatively few articles covering it, so this post can serve as a reference for anyone unfamiliar with it.

To make the idea easier to visualize, let's walk through a few example problems.

## Example problems

### [CSES - New Roads Queries](https://cses.fi/problemset/task/2101/)

**Problem statement**

In Byteland, there are $N$ cities with no roads between them initially. Each day, a new road is built, for a total of $M$ roads.
Your task is to answer $Q$ queries: find the first day on which you can travel from city $a$ to city $b$.

**Constraints**

- $1 \le N, M, Q \le 2 \cdot 10^5$
- $1 \le a, b \le N$

**Analysis**

Clearly, for each query we can binary search to find the first day when cities $a$ and $b$ are in the same connected component. Using DSU to check connectivity takes $\mathcal{O}(M\alpha(N)\log{M})$ per query. For $Q$ queries, the time complexity is $\mathcal{O}(QM\alpha(N)\log{M})$, which is too slow for the given constraints.

So where can we optimize? Suppose we are binary searching on the range $[l, r]$ (using the first $mid$ roads, where $mid = \frac{l + r}{2}$). Notice that if we binary search each query independently, for a specific value of $mid$ we end up rebuilding it over and over again. So a natural idea is to group all queries with the same search range $[l, r]$ and answer them simultaneously.

Initially, every query has the search range $[1, M]$. After the first step, the queries split into two sets: one with search range $[1, M / 2]$ and the other with $[M / 2, M]$. After the second step, they split into four sets with search ranges $[1, M / 4], [M / 4, M / 2], [M / 2, 3M / 4], [3M / 4, M]$. After $\log{M}$ steps, each query's search range narrows down to a single point, which is its answer. With this approach, we reduce the time complexity from $\mathcal{O}(QM\alpha(N)\log{M})$ to $\mathcal{O}((Q + M)\alpha(N)\log{M})$.

One way to visualize this process is to think of splitting the sets at each step as moving from the root down to the leaves of a binary tree. Initially, all queries are at the root with the search range $[1, M]$. Queries whose answer lies in $[1, mid]$ go to the left child, while the rest go to the right child.

Thus, the search works like the queries "walking" down a binary tree from the root to the leaves.

There are two ways to implement this technique. Below is the pseudocode for both approaches (where $T$ is a data structure that supports applying event updates and answering queries):

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

Depending on the problem and the data structure used, we choose whichever implementation fits best.

In this example, we use DSU, which does not support undoing edge additions, so we will use the second (iterative) approach.

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

**Complexity:**

- The time complexity of the implementation above is $\mathcal{O}((Q + M)\alpha(N)\log{M})$.
- Here, $\alpha(N)$ is the [inverse Ackermann function](https://en.wikipedia.org/wiki/Ackermann_function#Inverse), which is the complexity of DSU operations.

### [Meteors](https://szkopul.edu.pl/problemset/problem/7JrCYZ7LhEK4nBR5zbAXpcmM/site/?key=statement)

**Problem summary**

In the city of Byteoty, there are $N$ farmers and $M$ plots of land. Each plot has an owner $o_i$, and each farmer has a target amount of resources $g_i$. There are $K$ events occurring in order, each described by three values $l_i, r_i, x_i$, meaning that the plots from $l_i$ to $r_i$ each produce $x_i$ resources ($l_i$ can be greater than $r_i$ since the plots are arranged in a circle), and the owner of each plot receives the resources it produces. In other words, if a farmer owns $c$ plots in the range $[l_i, r_i]$, they receive $cx_i$ resources. For each farmer, find the first event at which they reach their target amount of resources.

**Constraints**

- $1 \le N, M, K \le 3 \times 10^5$
- $1 \le o_i \le N$
- $1 \le g_i, x_i \le 10^9$
- $1 \le l_i, r_i \le M$

**Analysis**

Suppose we only need to answer the query for a single farmer. We can binary search on the answer and use a [BIT](https://cp-algorithms.com/data_structures/fenwick.html) (Fenwick tree) or a [Segment Tree](https://cp-algorithms.com/data_structures/segment_tree.html) to apply the event updates. The time complexity is $\mathcal{O}((K + C_i)\log{M}\log{K})$, where $C_i$ is the number of plots owned by that farmer.

If we run this search $N$ times, the total complexity becomes $\mathcal{O}((NK + M)\log{M}\log{K})$. We can apply parallel binary search to reduce this complexity.

**Sample implementation**

<details class="spoiler">
<summary>Recursive</summary>

```cpp
#include <bits/stdc++.h>
using namespace std;

struct FenwickTree {
    int n;
    vector<long long> tree;
    FenwickTree() {}
    FenwickTree(int _n): n(_n) {
        tree.resize(n);
    }
    void clear() {
        fill(tree.begin(), tree.end(), 0);
    }
    void add(int pos, int val) {
        for (int i = pos; i < n; i |= (i + 1)) {
            tree[i] += val;
        }
    }
    void add(int l, int r, int val) {
        add(l, val);
        add(r + 1, -val);
    }
    long long query(int pos) {
        long long res = 0;
        for (int i = pos; i >= 0; i = (i & (i + 1)) - 1) {
            res += tree[i];
        }
        return res;
    }
} tree;

struct Event {
    int l, r, x;
};

const int N = (int) 3e5;
const int M = (int) 3e5;
const int K = (int) 3e5;
int n, m, k;
int owners[M], ans[N], target[N];
vector<int> lands[N];
Event events[K];

void add_event(int i, int coeff = 1) {
    auto [l, r, x] = events[i];
    x *= coeff;
    if (l <= r) tree.add(l, r, x);
    else {
        tree.add(l, m - 1, x);
        tree.add(0, r, x);
    }
}

void remove_event(int i) {
    add_event(i, -1);
}

void parallel_bs(int l, int r, vector<int> &candidates) {
    if(l > r || candidates.empty()) {
        return;
    }
    // add all events in [l, mid)
    int mid = (l + r) / 2;
    for(int i = l; i <= mid; i++) {
        add_event(i);
    }
    // divide candidates into two groups
    vector<int> fulfilled, not_fulfilled;

    for(int cand : candidates) {
        unsigned long long sum_resources = 0;
        for(int land : lands[cand]) {
            sum_resources += tree.query(land);
        }
        if (sum_resources >= 1ULL * target[cand]) {
            fulfilled.push_back(cand);
            ans[cand] = mid;
        }
        else {
            not_fulfilled.push_back(cand);
            // subtract the left part sum from target[cand] and search on the right part [mid + 1, r]
            target[cand] -= sum_resources;
        }
    }

    // remove all added events in [l, mid]
    for(int i = l; i <= mid; i++) {
        remove_event(i);
    }

    parallel_bs(l, mid - 1, fulfilled);
    parallel_bs(mid + 1, r, not_fulfilled);
    // Remove all elements and minimize memory size
    vector<int>().swap(fulfilled);
    vector<int>().swap(not_fulfilled);
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(0);

    cin >> n >> m;
    for (int i = 0; i < m; ++i) {
        cin >> owners[i];
        --owners[i];
        lands[owners[i]].push_back(i);
    }
    for (int i = 0; i < n; ++i) {
        cin >> target[i];
    }

    cin >> k;
    for (int i = 0; i < k; ++i) {
        cin >> events[i].l >> events[i].r >> events[i].x;
        --events[i].l;
        --events[i].r;
    }

    tree = FenwickTree(m);
    vector<int> candidates(n);
    for (int i = 0; i < n; ++i) {
        candidates[i] = i;
        ans[i] = -1;
    }

    parallel_bs(0, k - 1, candidates);

    for(int i = 0; i < n; i++) {
        if(ans[i] == -1) {
            cout << "NIE\n";
        }
        else {
            cout << ans[i] + 1 << '\n';
        }
    }
}

```

</details>

<details class="spoiler">
<summary>Iterative</summary>

```cpp
#include <bits/stdc++.h>
using namespace std;

struct FenwickTree {
    int n;
    vector<long long> tree;
    FenwickTree() {}
    FenwickTree(int _n): n(_n), tree(n) {}
    void clear() {
        fill(tree.begin(), tree.end(), 0);
    }
    void add(int i, int val) {
        while (i < n) {
            tree[i] += val;
            i |= (i + 1);
        }
    }
    void add(int l, int r, int val) {
        add(l, val);
        add(r + 1, -val);
    }
    long long query(int i) {
        long long res = 0;
        while (i >= 0) {
            res += tree[i];
            i = (i & (i + 1)) - 1;
        }
        return res;
    }
};

struct Event {
    int l, r, x;
};

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    int n, m;
    cin >> n >> m;
    vector<int> owners(m);
    vector<vector<int>> lands(n);
    for (int i = 0; i < m; ++i) {
        cin >> owners[i];
        --owners[i];
        lands[owners[i]].push_back(i);
    }
    vector<int> targets(n);
    for (int i = 0; i < n; ++i) {
        cin >> targets[i];
    }
    int k;
    cin >> k;
    vector<Event> events(k);
    for (int i = 0; i < k; ++i) {
        cin >> events[i].l >> events[i].r >> events[i].x;
        --events[i].l;
        --events[i].r;
    }
    vector<int> left(n, 1), right(n, k + 1);
    FenwickTree tree(m);
    vector<vector<int>> candidates(k + 1);
    while (true) {
        bool any = false;
        for (int i = 0; i < n; ++i) {
            if (left[i] < right[i]) {
                int mid = (left[i] + right[i]) >> 1;
                candidates[mid].push_back(i);
                any = true;
            }
        }
        if (!any) break;
        for (int mid = 1; mid <= k; ++mid) {
            auto [l, r, x] = events[mid - 1];
            if (l <= r) {
                tree.add(l, r, x);
            }
            else {
                tree.add(l, m - 1, x);
                tree.add(0, r, x);
            }
            for (int idx : candidates[mid]) {
                long long total = 0;
                for (int land : lands[idx]) {
                    total += tree.query(land);
                    if (total >= targets[idx]) break;
                }
                if (total >= targets[idx]) {
                    right[idx] = mid;
                }
                else {
                    left[idx] = mid + 1;
                }
            }
            candidates[mid].clear();
        }
        tree.clear();
    }
    for (int i = 0; i < n; ++i) {
        if (left[i] == k + 1) cout << "NIE\n";
        else cout << left[i] << '\n';
    }
    return 0;
}
```

</details>

**Complexity:** After optimization, the time complexity is $\mathcal{O}((K + M)\log{M}\log{K})$.

### [HDU5412 - CRB and Queries](http://acm.hdu.edu.cn/showproblem.php?pid=5412)

**Problem statement**

There are $N$ boys in CodeLand, where the $i$-th boy has a skill value of $A_i$. CRB wants to find someone with a suitable skill value. Help CRB handle the following two types of queries:

- $1 \; l \; v$: change the skill value of boy $l$ to $v$.
- $2 \; l \; r \; k$: find the $k$-th smallest skill value among the boys from $l$ to $r$.

You need to print the answer for each query of the second type.

**Constraints**

- $1 \le N, Q \le 10^5$
- $1 \le A_i, v \le 10^9$
- $1 \le l \le r \le N$
- $1 \le k \le r - l + 1$

**Solution**

We split the original operations into two types:

- **Updating an event:** We represent each element $A_i$ as a 4-tuple $(i, value, t, delta)$, meaning that after time $t$, $A_i = value$ with $delta = -1 \; \text{or} \; 1$. Initially, we add $(i, A_i, 0, 1)$ for all $1 \le i \le N$. Then, an update $l \; v$ is equivalent to adding $(l, A_l, t, -1)$ and $(l, v, t, 1)$, and setting $A_l = v$.
- **Answering a query:** To answer a query $l \; r \; k$, we binary search on the answer. For each value $mid$ in the possible value range, we sum the $delta$ values of all tuples $(i, value, t, delta)$ satisfying $l \le i \le r$, $value \le mid$, and $t \le time$, where $time$ is the timestamp of the query. If this sum is less than $k$, the answer must be greater than $mid$; otherwise, the answer is less than or equal to $mid$.

Since we need to preserve the chronological order of events and queries here, the recursive implementation is simpler.

**Sample implementation**

<details class="spoiler">
<summary>Code</summary>

```cpp
#include <iostream>
#include <vector>
#include <cassert>
#include <algorithm>
using namespace std;

const int N = (int) 1e5;
int tree[N], res[N];
int n, q;

void add(int pos, int val) {
    for (int i = pos; i < n; i |= (i + 1)) {
        tree[i] += val;
    }
}
int query(int pos) {
    int res = 0;
    for (int i = pos; i >= 0; i = (i & (i + 1)) - 1) {
        res += tree[i];
    }
    return res;
}
void clear_tree() {
    for (int i = 0; i < n; ++i) tree[i] = 0;
}

struct Event {
    int idx, val, time, delta;
};

struct Query {
    int l, r, k, time, idx;
};

void parallel_bs(int l, int r, const vector<Event> &events, const vector<Query> &queries) {
    if (l == r || queries.empty()) {
        for (int i = 0; i < (int) queries.size(); ++i) {
            res[queries[i].idx] = l;
        }
        return;
    }
    int mid = (l + r) >> 1;
    int e_sz = (int) events.size();
    int q_sz = (int) queries.size();
    vector<Event> left_events, right_events;
    vector<Query> left_queries, right_queries;
    for (int i = 0, j = 0; i < q_sz; ++i) {
        while (j < e_sz && events[j].time < queries[i].time) {
            if (events[j].val <= mid) {
                add(events[j].idx, events[j].delta);
                left_events.push_back(events[j]);
            }
            else {
                right_events.push_back(events[j]);
            }
            j++;
        }

        int cnt = query(queries[i].r) - query(queries[i].l - 1);
        if (cnt >= queries[i].k) {
            left_queries.push_back(queries[i]);
        }
        else {
            right_queries.push_back(queries[i]);
            right_queries.back().k -= cnt;
        }
    }
    for (int i = 0; i < (int) left_events.size(); ++i) {
        add(left_events[i].idx, -left_events[i].delta);
    }
    parallel_bs(l, mid, left_events, left_queries);
    parallel_bs(mid + 1, r, right_events, right_queries);
    vector<Event>().swap(left_events); vector<Event>().swap(right_events);
    vector<Query>().swap(left_queries); vector<Query>().swap(right_queries);
};

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    while (cin >> n) {
        vector<int> arr(n), vals;
        vector<Event> events;
        vector<Query> queries;
        for (int i = 0; i < n; ++i) {
            cin >> arr[i];
            vals.push_back(arr[i]);
            events.push_back({i, arr[i], 0, 1});
        }
        cin >> q;
        int q_cnt = 0;
        for (int i = 0; i < q; ++i) {
            int type;
            cin >> type;
            if (type == 1) {
                int l, v;
                cin >> l >> v;
                --l;
                events.push_back({l, arr[l], i + 1, -1});
                events.push_back({l, v, i + 1, 1});
                vals.push_back(v);
                arr[l] = v;
            }
            else {
                int l, r, k;
                cin >> l >> r >> k;
                --l; --r;
                queries.push_back({l, r, k, i + 1, q_cnt++});
            }
        }
        sort(vals.begin(), vals.end());
        vals.erase(unique(vals.begin(), vals.end()), vals.end());
        for (int i = 0; i < (int) events.size(); ++i) {
            events[i].val = lower_bound(vals.begin(), vals.end(), events[i].val) - vals.begin();
        }

        parallel_bs(0, (int) vals.size() - 1, events, queries);
        for (int i = 0; i < q_cnt; ++i) {
            cout << vals[res[i]] << '\n';
        }
        clear_tree();
    }
    return 0;
}
```

</details>

**Complexity:**

- Time complexity: The total number of events is $\mathcal{O}(N + Q)$, and each event update or query takes $\mathcal{O}(\log{N})$ time, so the overall time complexity is $\mathcal{O}((N + Q)\log(N + Q)\log{N})$.
- Space complexity: $\mathcal{O}((N + Q)\log(N + Q))$, or $\mathcal{O}(N + Q)$ if we free the memory of the `events` and `queries` vectors as in the implementation above.

## References

- https://codeforces.com/blog/entry/45578
- https://robert1003.github.io/2020/02/05/parallel-binary-search.html

## Practice problems

- [Stamp Rally](https://dmoj.ctu.edu.vn/problem/stamp1)
- [MKTHNUM](https://www.spoj.com/problems/MKTHNUM/)
- [COCI '20 Contest 6 #5 Index](https://dmoj.ctu.edu.vn/problem/index)
- [ICPC 2022 Central Vietnam - D: Median](https://oj.vnoi.info/problem/icpc22_mt_d)
- [Travel in HackerLand](https://www.hackerrank.com/contests/may-world-codesprint/challenges/travel-in-hackerland/submissions)
- [Make n00b_land Great Again!](https://www.hackerearth.com/challenges/competitive/may-circuits/algorithm/make-n00b_land-great-again-circuits/)
- [BZOJ2738 - Matrix multiplication](https://dmoj.ctu.edu.vn/problem/matmul1)
- [Selective Additions](https://www.hackerrank.com/contests/hourrank-23/challenges/selective-additions/problem)
- [Evil Chris](https://www.codechef.com/problems/MCO16504)
