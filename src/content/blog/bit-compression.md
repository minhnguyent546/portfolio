---
title: Examples of using bit compression
description: Examples of using bit compression to speed up algorithms.
tags:
  - bit-compression
  - bitset
topic: algorithms
thumbnail: ./bit-compression/thumbnail.svg
author: Minh Thien Nguyen
pubDatetime: 2023-10-16
lang: en
translationOf: bit-compression-vi
---

## Table of contents

## 1. Bit compression and storing a set

Suppose we need to operate on subsets of a set with $n$ elements $\{0, 1, \ldots, n - 1\}$, where $n \le 64$. We represent the set using a sequence of bits, where bit $i$ is $1$ if element $i$ belongs to the set and $0$ otherwise. Since $n \le 64$, we can represent it with a 64-bit unsigned integer: `unsigned long long x; // a set with at most 64 elements`.

Given two sets $A$ and $B$, we can express [set operations](<https://en.wikipedia.org/wiki/Set_(mathematics)#Basic_operations>) using integer operations as follows:

| Set operation                   | Bitwise operation        |             |
| ------------------------------- | ------------------------ | ----------- |
| $A \cap B$                      | $A \& B$                 | bitwise AND |
| $A \cup B$                      | $A \| B$                 | bitwise OR  |
| Complement of set $A$           | $\sim A$                 | bitwise NOT |
| $A \backslash B$                | $A \& \sim B$            |             |
| Add element $i$ to set $A$      | $A \| (1ull \ll i)$      | left shift  |
| Remove element $i$ from set $A$ | $A \& \sim (1ull \ll i)$ |             |

Here, `1ull` is the unit value (`1`) of type `unsigned long long`.

The harder part is counting the number of elements in the set, i.e., counting the number of $1$ bits in its binary representation. C++ provides built-in functions `__builtin_popcount` and `__builtin_popcountll` for this, which run in $\mathcal{O}(\log{w})$ where $w$ is the machine word size (usually $32$ or $64$, depending on the hardware). Alternatively, we can compute this manually for small sets, such as sets with at most 16 or 32 elements, by precomputing an array of size $2^{16}$ bytes to count the $1$ bits in $\mathcal{O}(1)$:

```cpp
char cnt[1 << 16];
void precompute() {
    for (int i = 0; i < (1 << 16); ++i) {
        cnt[i] = (i & 1) + cnt[i >> 1];
    }
}
int bit_count_16(unsigned int x) { return cnt[x]; }
int bit_count_32(unsigned int x) { return cnt[x >> 16] + cnt[x & 65535]; }
```

For larger sets, we can do the following:

```cpp
const int N = (int) 5e7; // maximum number of elements in the set
const int N1 = N / 32 + 1;
unsigned int a[N1];
int get(int i) { return (a[i >> 5] >> (i & 31)) & 1; }
void set_0(int i) { a[i >> 5] &= ~(1u << (i & 31)); }
void set_1(int i) { a[i >> 5] |= 1u << (i & 31); }
int count() {
    int sum = 0;
    for (int i = 0; i < N1; ++i) {
        sum += bit_count_32(a[i]);
    }
    return sum;
}
```

In C++, there is a similar data structure for performing these operations called [bitset](https://cplusplus.com/reference/bitset/bitset/):

```cpp
a[3] = 1; // set bit at index 3 to 1
a[3] = 0; // set bit at index 3 to 0
int x = a[3];
printf("%d\n", (int) a[3]); // need to cast bitset<100>::reference to int
a = a | b; a |= b; // union of two sets
a = a & b; a &= b; // intersection of two sets
a = b >> 10; b = a << 10; // shift bits right and left
a = a & ~b; // difference of two sets
int c = (int) a.count(); // count the number of 1 bits in a
a.reset(3); b.reset(); // unset bit
```

Accessing and assigning element $i$ takes $\mathcal{O}(1)$ time, while the remaining operations on `bitset<n>` take $\mathcal{O}\left(\frac{n}{w}\right)$ time, where $w$ is the machine word size.

A bitset is just like a regular array, so we can traverse it with a pointer as follows:

```cpp
const int N = 40;
bitset<N> a;
uint8_t *ptr = (uint8_t*) &a;
ptr[0] = 10; // set the first 8 bits to 00001010
ptr[1] = 132; // set the next 8 bits to 10000100
cout << a << '\n'; // 00000000000000001000010000001010
```

The rest of this article presents examples of using `bitset`. For brevity, arrays are zero-initialized by default unless stated otherwise.

## 2. Multiplying two boolean matrices in $\mathcal{O}(n^3 / \log{n})$

Standard matrix multiplication runs in $\mathcal{O}(n^3)$:

```cpp
for (int i = 0; i < n; ++i) {
    for (int j = 0; j < n; ++j) {
        for (int k = 0; k < n; ++k) {
            c[i][j] += a[i][k] * b[k][j];
        }
    }
}
```

If we multiply two boolean matrices over the field $\mathbb{F}_2$ (where the matrix entries are in $\{0, 1\}$, and addition and multiplication between entries are taken modulo $2$; see also [Field](<https://en.wikipedia.org/wiki/Field_(mathematics)#Finite_fields>)):

```cpp
for (int i = 0; i < n; ++i) {
    for (int j = 0; j < n; ++j) {
        for (int k = 0; k < n; ++k) {
            c[i][j] ^= a[i][k] & b[k][j];
        }
    }
}
```

Note that the order of the loops does not matter, so we can write:

```cpp
for (int i = 0; i < n; ++i) {
    for (int k = 0; k < n; ++k) {
        if (a[i][k]) {
            for (int j = 0; j < n; ++j) {
                c[i][j] ^= b[k][j];
            }
        }
    }
}
```

We can use `bitset` to reduce the complexity as follows:

```cpp
const int N = 500;
bitset<N> a[N], b[N], c[N];
for (int i = 0; i < n; ++i) { // n <= N
    for (int k = 0; k < n; ++k) {
        if (a[i][k]) {
            c[i] ^= b[k];
        }
    }
}
```

With `bitset`, we have reduced the complexity to $\mathcal{O}(n^3 / w)$, where $w$ is the machine word size (usually $32$ or $64$). Observe that $n \le 2^w \Rightarrow \log{n} \le w$. Therefore, we can rewrite the complexity of the code above as $\mathcal{O}(n^3 / \log{n})$.

## 3. Finding the transitive closure with Floyd–Warshall in $\mathcal{O}(n^3 / \log{n})$

**Problem:** The transitive closure of a binary relation $R$ on $X$ is the smallest relation $S$ on $X$ that contains $R$ and is transitive, meaning that if $xSy$ and $ySz$, then $xSz$.

If we view the relation as a directed graph whose vertices are the elements of $X$, with a directed edge $(u, v)$ whenever $uRv$, the problem becomes finding all pairs $(u, v)$ such that there is a path from $u$ to $v$. Applying the idea of the Floyd–Warshall algorithm, we can write:

```cpp
const int N = 500;
int d[N][N];
for (int k = 0; k < n; ++k) { // n <= N
    for (int i = 0; i < n; ++i) {
        for (int j = 0; j < n; ++j) {
            d[i][j] |= d[i][k] & d[k][j];
        }
    }
}
```

Just as in the previous section, we eliminate the $\&$ operator:

```cpp
for (int k = 0; k < n; ++k) {
    for (int i = 0; i < n; ++i) {
        if (d[i][k]) {
            for (int j = 0; j < n; ++j) {
                d[i][j] |= d[k][j];
            }
        }
    }
}
```

Using `bitset` to reduce the complexity, we get the following code:

```cpp
const int N = 500;
bitset<N> d[N];
for (int k = 0; k < n; ++k) { // n <= N
    for (int i = 0; i < n; ++i) {
        if (d[i][k]) {
            d[i] |= d[k];
        }
    }
}
```

Thus, we can find the transitive closure in $\mathcal{O}(n^3 / \log{n})$.

## 4. Multiplying two polynomials in $\mathcal{O}(n^2 / \log{n})$

Suppose we need to multiply two polynomials over the field $\mathbb{F}_2$. Standard multiplication gives $\mathcal{O}(n^2)$ complexity:

```cpp
for (int i = 0; i < n; ++i) {
    for (int j = 0; j < n; ++j) {
        c[i + j] ^= a[i] & b[j];
    }
}
```

We eliminate the $\&$ operator as follows:

```cpp
for (int i = 0; i < n; ++i) {
    if (a[i]) {
        for (int j = 0; j < n; ++j) {
            c[i + j] ^= b[j];
        }
    }
}
```

Using `bitset`, we obtain:

```cpp
const int N = 500;
bitset<N * 2> a, b, c;
for (int i = 0; i < n; ++i) { // n <= N
    if (a[i]) {
        c ^= b << i;
    }
}
```

Polynomial division with remainder over $\mathbb{F}_2$ in $\mathcal{O}(n^2 / \log{n})$ is left to the reader as an exercise.

Now let's move on to a harder problem: multiplying two polynomials over $\mathbb{Z}$ whose coefficients are in $\{0, 1\}$. First, we reverse array $b$ as follows:

```cpp
for (int i = 0; i < n; ++i) {
    b1[i] = b[n - i - 1];
}
```

We have: $(a * b)[k] = \sum\limits_{i = 0}^{n - 1}{b[k - i]a[i]} = \sum\limits_{i = 0}^{n - 1}{b_1[i + n - k - 1]a[i]}$

- If $k \le n - 1:$
  $(a * b)[k] =\sum\limits_{i = 0}^{n - 1}{b_1[i + \underbrace{n - k - 1}_{\ge 0}]a[i]} = a\ \&\ (b_1 \gg (n - k - 1))$
- If $k \gt n - 1:$
  $(a * b)[k] =\sum\limits_{i = 0}^{n - 1}{b_1[i - (\underbrace{k - n + 1}_{\gt 0})]a[i]} = a\ \&\ (b_1 \ll (k - n + 1))$

```cpp
int c[N * 2 - 1];
for (int i = 0; i < n; ++i) {
    b1[i] = b[n - i - 1];
}
for (int k = 0; k < n; ++k) {
    c[k] = (int) (a & (b1 >> (n - k - 1))).count();
}
for (int k = n; k < 2 * n - 1; ++k) {
    c[k] = (int) (a & (b1 << (k - n + 1))).count();
}
```

_Note:_ Here we do not need to worry about indices going out of bounds, because we use bit shifts and the $0$ bits do not affect the result.

## 5. Knapsack problem in $\mathcal{O}(nW / \log{W})$

**Problem:** Given an array $a$ of $n$ positive integers and an integer $W$, find a subset of the given array whose elements sum to exactly $W$.

First, we use standard dynamic programming to check whether a valid subset exists.

Standard DP in $\mathcal{O}(nW)$:

```cpp
int a[N];
bool can[MAX_W + 1];
can[0] = 1;
for (int i = 0; i < n; ++i) {
    for (int x = W - a[i]; x >= 0; --x) {
        can[x + a[i]] = can[x + a[i]] | can[x];
    }
}
cout << (can[W] ? "YES" : "NO") << '\n';
```

Using `bitset` achieves a better complexity of $\mathcal{O}(nW / \log{W})$:

```cpp
bitset<W + 1> can;
can[0] = 1;
for (int i = 0; i < n; ++i) {
    can |= can << a[i];
}
cout << (can[W] ? "YES" : "NO") << '\n';
```

Next, let's reconstruct the answer in $\mathcal{O}(nW)$:

```cpp
int a[N];
bool can[MAX_W + 1];
int trace[MAX_W + 1];
can[0] = 1;
for (int i = 0; i < n; ++i) {
    for (int x = W - a[i]; x >= 0; --x) {
        if (can[x] && !can[x + a[i]]) {
            can[x + a[i]] = 1;
            trace[x + a[i]] = i;
        }
    }
}
if (!can[W]) {
    cout << "NO" << '\n';
}
else {
    cout << "YES" << '\n';
    for (int x = W; x > 0; x -= a[trace[x]]) {
        cout << trace[x] << ' ';
    }
}
```

Now, to speed up the algorithm, we need to iterate efficiently over the values of $x$ where $can[x] = 1$ and $can[x + a[i]] = 0$. With `bitset`, these are precisely the positions of the $1$ bits in $can \& \sim (can \ll a[i])$.
Complexity: $\mathcal{O}(nW / \log{W} + W\log{W})$:

```cpp
int a[N];
bitset<MAX_W> can, tmp;
int trace[MAX_W + 1];
can[0] = 1;
for (int i = 0; i < n; ++i) {
    tmp = can & ~(can << a[i]);
    uint32_t *ptr = (uint32_t*) &tmp;
    for (int j = 0; j < W / 32; ++j) {
        if (!ptr[j]) continue;
        for (int bit = 0; bit < 32; ++bit) {
            if (ptr[j] & (1 << bit)) {
                can[bit + (j << 5)] = 1;
                trace[bit + (j << 5)] = i;
            }
        }
    }
}
```

Although the complexity is better, creating the intermediate bitset `tmp` makes the runtime slower than other `bitset` implementations with the same complexity.

We can still improve the iteration over $x$ "a bit" further using the built-in functions `_Find_first` and `_Find_next` in C++'s `bitset` header. See more [here](https://codeforces.com/blog/entry/43718):

```cpp
int a[N];
bitset<MAX_W> can, tmp;
int trace[MAX_W + 1];
can[0] = 1;
for (int i = 0; i < n; ++i) {
    tmp = can & ~(can << a[i]);
    for (int j = tmp._Find_first(); j < tmp.size(); j = tmp._Find_next(j)) {
        can[j] = 1;
        trace[j] = i;
    }
}
```

At this point, the code looks way more magical :)).

## 6. Gaussian elimination in $\mathcal{O}(n^3 / \log{n})$

**Problem:** Compute the determinant of a boolean matrix over the field $\mathbb{F}_2$:

```cpp
const int N = 500;
bitset<N> a[N]; // matrix whose determinant we want to compute
int n; // n <= N;

int determinant() {
    for (int i = 0; i < n; ++i) {
        int k = i;
        while (k < n && a[k][i] == 0) ++k;
        if (k == n) return 0;
        swap(a[i], a[k]);
        for (int j = i + 1; j < n; ++j) {
            if (a[j][i]) {
                a[j] ^= a[i];
            }
        }
    }
    return 1;
}
```
