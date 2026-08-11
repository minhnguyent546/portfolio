---
title: Parallel Binary Search (Kỹ thuật tìm kiếm nhị phân song song)
description: Kĩ thuật giúp trả lời nhiều truy vấn cùng lúc bằng tìm kiếm nhị phân song song, dùng chung dữ liệu trung gian thay vì xây dựng lại từ đầu cho từng truy vấn.
tags:
  - binary-search
  - parallel-binary-search
author: Minh Thien Nguyen
pubDatetime: 2023-08-26
lang: vi
---

## Mục lục

## Giới thiệu

Nói một cách dễ hiểu thì tìm kiếm nhị phân song song là tìm kiếm nhị phân **một cách song song** và tận dụng dữ liệu đã xây dựng trước đó thay vì phải xây dựng lại nhiều lần (tư tưởng khá giống với quy hoạch động).

Thông thường những bài toán mà ta có thể áp dụng tìm kiếm nhị phân để tìm kết quả cho từng truy vấn riêng biệt và để trả lời hết $Q$ truy vấn ta áp dụng việc tìm kiếm trên $Q$ lần (thông thường sẽ TLE) thì kỹ thuật tìm kiếm nhị phân song song sẽ giúp ta giảm độ phức tạp của việc tìm kiếm trên.

Đây là một kỹ thuật không mới nhưng mình thấy còn khá ít bài viết nói về kỹ thuật này nên bài viết này có thể xem như một nguồn tham khảo cho những ai chưa biết đến kỹ thuật này.

Để dễ hình dung hơn thì chúng ta hãy cùng đi vào một số bài tập ví dụ sau đây.

## Các bài tập ví dụ

### [CSES - New Roads Queries](https://cses.fi/problemset/task/2101/)

**Đề bài**

Ở Byteland có $N$ thành phố, ban đầu không có con đường nào giữa các thành phố. Vào mỗi ngày, một con đường mới sẽ được xây dựng. Có tổng cộng $M$ con đường.
Nhiệm vụ của bạn là cần trả lời $Q$ truy vấn: tìm ngày đầu tiên mà ta có thể đi từ thành phố $a$ đến thành phố $b$.

**Giới hạn**

- $1 \le N, M, Q \le 2 \cdot 10^5$
- $1 \le a, b \le N$

**Phân tích**

Dễ thấy với mỗi truy vấn ta có thể áp dụng tìm kiếm nhị phân để tìm ngày đầu tiên hai thành phố $a$ và $b$ nằm trong cùng một thành phần liên thông, ở đây nếu dùng DSU để kiểm tra thì độ phức tạp mỗi truy vấn là $\mathcal{O}(M\alpha(N)\log{M})$. Độ phức tạp cho $Q$ truy vấn là $\mathcal{O}(QM\alpha(N)\log{M})$, không khả thi với giới hạn đề bài.

Vậy đâu là điểm mà ta có thể tối ưu? Giả sử ta đang thực hiện việc tìm kiếm nhị phân trong đoạn $[l, r]$ (dùng $mid$ con đường đầu tiên, trong đó $mid = \frac{l + r}{2}$), có thể thấy nếu tìm kiếm nhị phân các truy vấn một cách riêng biệt thì với một giá trị $mid$ cụ thể ta đã phải xây dựng đi, xây dựng lại nhiều lần. Do đó ta sẽ nghĩ đến việc nhóm tất cả những truy vấn có cùng khoảng tìm kiếm $[l, r]$ và trả lời một cách đồng thời.

Khởi đầu khoảng tìm kiếm của tất cả các truy vấn đều là $[1, M]$. Sau bước đầu tiên thì các truy vấn chia làm hai tập, một tập gồm các truy vấn có khoảng tìm kiếm là $[1, M / 2]$, tập còn lại là $[M / 2, M]$. Đến bước hai thì chia làm bốn tập có các khoảng tìm kiếm là $[1, M / 4], [M / 4, M / 2], [M / 2, 3M / 4], [3M / 4, M]$. Sau $\log{M}$ bước thì các truy vấn đều có khoảng tìm kiếm chỉ chứa một điểm duy nhất, chính là đáp án của truy vấn đó. Với cách tiếp cận này ta đã giảm độ phức tạp của thuật toán từ $\mathcal{O}(QM\alpha(N)\log{M})$ xuống còn $\mathcal{O}((Q + M)\alpha(N)\log{M})$.

Một cách để hình dung quá trình này đó là xem việc chia các tập ở mỗi bước giống như việc đi từ gốc xuống các nút lá trên cây nhị phân. Ban đầu tất cả truy vấn đều ở gốc với khoảng tìm kiếm $[1, M]$, các truy vấn có đáp án nằm trong đoạn $[1, mid]$ thì đi xuống nút con bên trái, ngược lại thì đi xuống nút con bên phải.

Do đó việc tìm kiếm giống như việc các truy vấn "đi" trên cây nhị phân từ gốc xuống nút lá.

Kỹ thuật này có hai cách cài đặt, dưới đây là mã giả của hai cách cài đặt này (trong đó $T$ là cấu trúc dữ liệu cho phép ta cập nhật các sự kiện và trả lời các truy vấn):

**Pseudo code (recursive)**

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

**Pseudo code (iterative)**

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

Tùy theo bài toán và cấu trúc dữ liệu được dùng mà ta sẽ chọn cách cài đặt phù hợp.

Trong ví dụ này ta dùng DSU nên không thể đảo ngược việc thêm các cạnh. Do đó ta sẽ cài theo cách thứ hai.

**Cài đặt mẫu**

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

**Độ phức tạp:**

- Độ phức tạp của cách cài đặt trên là $\mathcal{O}((Q + M)\alpha(N)\log{M})$.
- Trong đó $\alpha(N)$ là hàm [Ackermann nghịch đảo](https://en.wikipedia.org/wiki/Ackermann_function#Inverse) - độ phức tạp cho các thao tác của DSU.

### [Meteors](https://szkopul.edu.pl/problemset/problem/7JrCYZ7LhEK4nBR5zbAXpcmM/site/?key=statement)

**Tóm tắt đề bài**

Ở thành phố Byteoty có $N$ người nông dân và $M$ vùng đất, mỗi vùng đất có một người chủ $o_i$ và mỗi người nông dân có một giá trị tài nguyên mong muốn $g_i$. Có $K$ sự kiện xảy ra tuần tự. Mỗi sự kiện được miêu tả bởi ba giá trị $l_i, r_i, x_i$ có nghĩa các vùng đất từ $l_i$ đến $r_i$ sẽ tạo ra lượng tài nguyên $x_i$ ($l_i$ có thể lớn hơn $r_i$ vì các vùng đất xếp theo vòng tròn) và chủ sở hữu của vùng đất sẽ nhận được lượng tài nguyên vùng đất tạo ra. Nói cách khác, nếu người nông dân có $c$ vùng đất trong đoạn $[l_i, r_i]$ thì sẽ nhận được lượng tài nguyên $cx_i$. Với mỗi người nông dân, hãy cho biết sự kiện đầu tiên người nông dân đạt được ngưỡng tài nguyên mong muốn.

**Giới hạn**

- $1 \le N, M, K \le 3 \times 10^5$
- $1 \le o_i \le N$
- $1 \le g_i, x_i \le 10^9$
- $1 \le l_i, r_i \le M$

**Phân tích**

Giả sử ta chỉ cần trả lời truy vấn cho một người nông dân. Lúc này ta có thể áp dụng tìm kiếm nhị phân trên đáp án và dùng [$BIT$](https://cp-algorithms.com/data_structures/fenwick.html) hoặc [$SegmentTree$](https://cp-algorithms.com/data_structures/segment_tree.html) để cập nhật các sự kiện. Độ phức tạp là $\mathcal{O}((K + C_i)\log{M}\log{K})$ với $C_i$ là số vùng đất của người nông dân.

Nếu ta tìm kiếm $N$ lần, độ phức tạp sẽ là $\mathcal{O}((NK + M)\log{M}\log{K})$. Ta sẽ áp dụng tìm kiếm nhị phân song song để giảm độ phức tạp.

**Cài đặt mẫu**

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

**Độ phức tạp:** độ phức tạp sau khi tối ưu là $\mathcal{O}((K + M)\log{M}\log{K})$.

### [HDU5412 - CRB and Queries](http://acm.hdu.edu.cn/showproblem.php?pid=5412)

**Đề bài**

Có $N$ chàng trai ở CodeLand. Chàng trai thứ $i$ có chỉ số kỹ năng $A_i$. CRB đang muốn tìm người có chỉ số kỹ năng thích hợp. Bạn hãy giúp CRB thực hiện hai loại truy vấn sau đây:

- $1 \; l \; v$: chỉ số kỹ năng của chàng trai $l$ thay đổi thành $v$.
- $2 \; l \; r \; k$: tìm chỉ số kỹ năng nhỏ thứ $k$ trong số những chàng trai từ $l$ đến $r$.

Bạn cần in ra đáp án cho mỗi truy vấn thứ hai.

**Giới hạn**

- $1 \le N, Q \le 10^5$
- $1 \le A_i, v \le 10^9$
- $1 \le l \le r \le N$
- $1 \le k \le r - l + 1$

**Lời giải**

Ta sẽ chia các thao tác truy vấn ban đầu thành hai loại:

- **Cập nhật một sự kiện:** ta sẽ đại diện mỗi phần tử $A_i$ bởi một bộ bốn số $(i, value, t, delta)$ với ý nghĩa sau thời gian $t, A_i = value$ và $delta = -1 \; \text{hoặc} \; 1$. Lúc khởi đầu ta sẽ thêm $(i, A_i, 0, 1)$ với $1 \le i \le N$. Khi đó thao tác cập nhật $l \; v$ sẽ tương đương với việc thêm $(l, A_l, t, -1)$ và $(l, v, t, 1)$ và gán $A_l = v$.
- **Trả lời một truy vấn:** để trả lời một truy vấn $l \; r \; k$ ta sẽ tìm kiếm nhị phân trên đáp án. Với mỗi giá trị $mid$ thuộc miền giá trị có thể, ta sẽ cộng tất cả giá trị $delta$ của các bộ $(i, value, t, delta)$ thỏa mãn $l \le i \le r, value \le mid, t \le time$ với $time$ là thứ tự thời gian của truy vấn. Nếu tổng trên nhỏ hơn $k$ thì ta biết đáp án cần tìm sẽ lớn hơn $mid$, ngược lại đáp án cần tìm sẽ nhỏ hơn hoặc bằng $mid$.

Vì ở đây ta cần giữ thứ tự thời gian của các sự kiện và truy vấn. Do đó cách cài đặt đệ quy sẽ đơn giản hơn.

**Cài đặt mẫu**

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

**Độ phức tạp**:

- Độ phức tạp thời gian: số sự kiện là $\mathcal{O}(N + Q)$, độ phức tạp cho mỗi thao tác cập nhật sự kiện hoặc truy vấn là $\mathcal{O}(\log{N})$, do đó độ phức tạp thời gian là $\mathcal{O}((N + Q)\log(N + Q)\log{N})$.
- Độ phức tạp bộ nhớ: $\mathcal{O}((N + Q)\log(N + Q))$ hoặc $\mathcal{O}(N + Q)$ nếu giải phóng bộ nhớ của các mảng $events$ và $queries$ như cách cài đặt trên.

## Tham khảo

- https://codeforces.com/blog/entry/45578
- https://robert1003.github.io/2020/02/05/parallel-binary-search.html

## Bài tập luyện tập

- [Stamp Rally](https://dmoj.ctu.edu.vn/problem/stamp1)
- [MKTHNUM](https://www.spoj.com/problems/MKTHNUM/)
- [COCI '20 Contest 6 #5 Index](https://dmoj.ctu.edu.vn/problem/index)
- [ICPC 2022 miền Trung - D: Median](https://oj.vnoi.info/problem/icpc22_mt_d)
- [Travel in HackerLand](https://www.hackerrank.com/contests/may-world-codesprint/challenges/travel-in-hackerland/submissions)
- [Make n00b_land Great Again!](https://www.hackerearth.com/challenges/competitive/may-circuits/algorithm/make-n00b_land-great-again-circuits/)
- [BZOJ2738 - Matrix multiplication](https://dmoj.ctu.edu.vn/problem/matmul1)
- [Selective Additions](https://www.hackerrank.com/contests/hourrank-23/challenges/selective-additions/problem)
- [Evil Chris](https://www.codechef.com/problems/MCO16504)
