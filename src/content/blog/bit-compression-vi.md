---
title: Examples of using bit compression (Một số ví dụ về bit-compression)
description: Các ví dụ về cách dùng bit-compression để tăng tốc thuật toán.
tags:
  - bit-compression
  - bitset
topic: algorithms
author: Minh Thien Nguyen
pubDatetime: 2023-10-16
lang: vi
---

## Mục lục

## 1. Bit-compression và việc lưu một tập

Giả sử chúng ta cần thao tác trên các tập con (subsets) của một tập (set) có $n$ phần tử $\{0, 1, \ldots, n - 1\}$ với $n \le 64$. Ta sẽ dùng một dãy bit để biểu diễn tập trên. Trong đó bit $i$ là $1$ nếu phần tử $i$ có trong tập, ngược lại bit $i$ là $0$. Vì $n \le 64$ nên ta có thể dùng một số nguyên không dấu $64$ bit để biểu diễn: `unsigned long long x; // một tập có không quá 64 phần tử`.

Giả sử chúng ta có hai tập $A$ và $B$. Ta sẽ tìm cách biểu diễn [các toán tử trên tập hợp](<https://en.wikipedia.org/wiki/Set_(mathematics)#Basic_operations>) thông qua các toán tử trên số nguyên như sau:

| Toán tử trên tập hợp         | Toán tử bitwise          |               |
| ---------------------------- | ------------------------ | ------------- |
| $A \cap B$                   | $A \& B$                 | bitwise AND   |
| $A \cup B$                   | $A \| B$                 | bitwise OR    |
| Phần bù của tập A            | $\sim A$                 | bitwise NOT   |
| $A \backslash B$             | $A \& \sim B$            |               |
| Thêm phần tử $i$ vào tập $A$ | $A \| (1ull \ll i)$      | dịch trái bit |
| Xoá phần tử $i$ khỏi tập $A$ | $A \& \sim (1ull \ll i)$ |               |

Trong đó `1ull` là giá trị đơn vị của kiểu `unsigned long long`.

Phần khó hơn đó chính là đếm số phần tử trong tập hợp, hay đếm số bit $1$ trong biểu diễn nhị phân tương ứng. Trong C++ có một hàm đặc biệt giúp ta làm việc này là `__builtin_popcount` và `__builtin_popcountll` có độ phức tạp $\mathcal{O}(\log{w})$ với $w$ là độ dài của machine word (thông thường là $32$ hoặc $64$ tuỳ vào cấu trúc phần cứng). Ngoài ra ta có thể tính thủ công đối với các tập nhỏ, ví dụ các tập có tối đa 16 hoặc 32 phần tử, khi đó ta có thể đếm số bit $1$ trong $\mathcal{O}(1)$ bằng việc tính toán trước một mảng kích thước $2^{16}$ bytes.

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

Với các tập lớn hơn có thể làm như sau:

```cpp
const int N = (int) 5e7; // số phần tử tối đa của tập
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

Trong C++, có một cấu trúc dữ liệu tương tự để thực hiện các thao tác trên là [bitset](https://cplusplus.com/reference/bitset/bitset/):

```cpp
a[3] = 1; // set bit index 3 bằng 1
a[3] = 0; // set bit index 3 bằng 0
int x = a[3];
printf("%d\n", (int) a[3]); // cần ép kiểu bitset<100>::reference thành int
a = a | b; a |= b; // hợp hai tập
a = a & b; a &= b; // giao hai tập
a = b >> 10; b = a << 10; // dịch bit sang phải và trái
a = a & ~b; // hiệu của hai tập
int c = (int) a.count(); // đếm số bit 1 trong a
a.reset(3); b.reset(); // unset bit
```

Việc truy cập và gán phần tử $i$ có độ phức tạp là $\mathcal{O}(1)$, các toán tử còn lại của `bitset<n>` có độ phức tạp $\mathcal{O}\left(\frac{n}{w}\right)$ trong đó $w$ là độ dài của machine word.

Bitset cũng giống như một mảng thông thường, do đó ta có thể duyệt qua bitset bằng pointer như sau:

```cpp
const int N = 40;
bitset<N> a;
uint8_t *ptr = (uint8_t*) &a;
ptr[0] = 10; // gán 8 bits đầu tiên bằng 00001010
ptr[1] = 132; // gán 8 bits tiếp theo bằng 10000100
cout << a << '\n'; // 00000000000000001000010000001010
```

Ở phần còn lại của bài viết là các ví dụ về việc sử dụng bitset. Để cho ngắn gọn thì các mảng mặc định sẽ được khởi tạo với giá trị 0, trừ khi được chỉ ra cụ thể.

## 2. Nhân hai ma trận boolean trong $\mathcal{O}(n^3 / \log{n})$

Nhân hai ma trận theo cách thông thường sẽ có độ phức tạp $\mathcal{O}(n^3)$:

```cpp
for (int i = 0; i < n; ++i) {
    for (int j = 0; j < n; ++j) {
        for (int k = 0; k < n; ++k) {
            c[i][j] += a[i][k] * b[k][j];
        }
    }
}
```

Nếu ta nhân hai ma trận boolean trên trường $\mathbb{F}_2$ (các phần tử của ma trận thuộc tập $\{0, 1\}$ và các phép cộng và phép nhân giữa các phần tử được chia lấy dư cho $2$), xem thêm [Field](<https://en.wikipedia.org/wiki/Field_(mathematics)#Finite_fields>):

```cpp
for (int i = 0; i < n; ++i) {
    for (int j = 0; j < n; ++j) {
        for (int k = 0; k < n; ++k) {
            c[i][j] ^= a[i][k] & b[k][j];
        }
    }
}
```

Lưu ý rằng thứ tự các vòng lặp là không quan trọng, do đó ta có thể viết:

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

Sử dụng bitset để giảm độ phức tạp như sau:

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

Với việc sử dụng bitset ta đã giảm độ phức tạp xuống còn $\mathcal{O}(n^3 / w)$ với $w$ là dộ dài của machine word (thường là $32$ hoặc $64$). Nhận xét rằng $n \le 2^w \Rightarrow \log{n} \le w$. Do đó ta có thể viết lại độ phức tạp của đoạn code trên là $\mathcal{O}(n^3 / \log{n})$.

## 3. Tìm `transitive closure` với thuật toán Floyd–Warshall trong $\mathcal{O}(n^3 / \log{n})$

**Bài toán:** transitive closure (bao đóng bắc cầu) của quan hệ hai ngôi $R$ trên $X$ là một quan hệ $S$ nhỏ nhất trên $X$ chứa $R$ và có tính bắc cầu, có nghĩa nếu $xSy$ và $ySz$ thì $xSz$.

Nếu ta xem các quan hệ như một đồ thị có hướng với các đỉnh là các phần tử trong $X$ và có cung $(u, v)$ nếu $uRv$. Bài toán trở thành tìm tất cả các cặp $(u, v)$ sao cho có đường đi từ $u$ đến $v$. Áp dụng ý tưởng của thuật toán Floyd-Warshall ta có thể viết:

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

Như ở phần trên ta sẽ tìm cách loại bỏ toán tử $\&$:

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

Dùng bitset để giảm độ phức tạp ta có đoạn code như sau:

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

Như vậy ta đã có thể tìm transitive closure trong $\mathcal{O}(n^3 / \log{n})$.

## 4. Nhân hai đa thức trong $\mathcal{O}(n^2 / \log{n})$

Giả sử ta cần nhân hai đa thức trên trường $\mathbb{F}_2$, cách nhân thông thường cho ta độ phức tạp $\mathcal{O}(n^2)$:

```cpp
for (int i = 0; i < n; ++i) {
    for (int j = 0; j < n; ++j) {
        c[i + j] ^= a[i] & b[j];
    }
}
```

Loại bỏ toán tử $\&$ như sau:

```cpp
for (int i = 0; i < n; ++i) {
    if (a[i]) {
        for (int j = 0; j < n; ++j) {
            c[i + j] ^= b[j];
        }
    }
}
```

Dùng bitset ta được:

```cpp
const int N = 500;
bitset<N * 2> a, b, c;
for (int i = 0; i < n; ++i) { // n <= N
    if (a[i]) {
        c ^= b << i;
    }
}
```

Chia hai đa thức với phần dư trên trường $\mathbb{F}_2$ trong $\mathcal{O}(n^2 / \log{n})$ xin nhường lại cho bạn đọc như bài tập vận dụng.

Bây giờ ta sẽ đến với phần khó hơn: nhân hai đa thức trên $\mathbb{Z}$ trong đó các hệ số thuộc $\{0, 1\}$. Đầu tiên ta đảo ngược mảng $b$ như sau:

```cpp
for (int i = 0; i < n; ++i) {
    b1[i] = b[n - i - 1];
}
```

Ta có: $(a * b)[k] = \sum\limits_{i = 0}^{n - 1}{b[k - i]a[i]} = \sum\limits_{i = 0}^{n - 1}{b_1[i + n - k - 1]a[i]}$

- Nếu $k \le n - 1:$
  $(a * b)[k] =\sum\limits_{i = 0}^{n - 1}{b_1[i + \underbrace{n - k - 1}_{\ge 0}]a[i]} = a\ \&\ (b_1 \gg (n - k - 1))$
- Nếu $k \gt n - 1:$
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

_Ghi chú:_ ở đây ta không cần quan tâm đến việc chỉ số tràn ra khỏi mảng do ta dùng bit shift và các bit $0$ sẽ không ảnh hưởng đến kết quả.

## 5. Bài toán cái túi trong $\mathcal{O}(nW / \log{W})$

**Bài toán:** cho một mảng $a$ có $n$ số nguyên dương và số nguyên $W$, bạn cần tìm một tập con của mảng đã cho sao cho tổng các phần tử đúng bằng $W$.

Đầu tiên ta sẽ dùng cách quy hoạch động thông thường và kiểm tra xem liệu có tồn tại tập con thoả mãn hay không.

Quy hoạch động thông thường trong $\mathcal{O}(nW)$:

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

Sử dụng bitset để đạt được độ phức tạp tốt hơn trong $\mathcal{O}(nW / \log{W})$:

```cpp
bitset<W + 1> can;
can[0] = 1;
for (int i = 0; i < n; ++i) {
    can |= can << a[i];
}
cout << (can[W] ? "YES" : "NO") << '\n';
```

Tiếp theo ta sẽ truy vết lại đáp án trong $\mathcal{O}(nW)$:

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

Bây giờ để tăng tốc thuật toán ta cần duyệt qua các giá trị $x$ mà $can[x] = 1$ và $can[x + a[i]] = 0$ một cách hiệu quả. Nếu dùng bitset thì đó chính xác là vị trí các bit $1$ trong $can \& \sim (can \ll a[i])$.
Độ phức tạp $\mathcal{O}(nW / \log{W} + Wlog{W})$:

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

Mặc dù độ phức tạp đã tốt hơn nhưng do việc tạo bitset trung gian `tmp` nên thời gian chạy sẽ chậm hơn so với các cài đặt bitset có cùng độ phức tạp.

Ta vẫn có thể cải tiến thêm phần duyệt $x$ của đoạn code "một chút" bằng các hàm có sẵn trong header bitset của C++ là `_Find_first` và `_Find_next`. Xem thêm [tại đây](https://codeforces.com/blog/entry/43718):

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

Đến đây thì đoạn code đã trông ảo ma hơn rất nhiều :)).

## 6. Gauss trong $\mathcal{O}(n^3 / \log{n})$

**Bài toán:** tính định thức của một ma trận boolean trên trường $\mathbb{F}_2$:

```cpp
const int N = 500;
bitset<N> a[N]; // ma trận cần tính định thức
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
