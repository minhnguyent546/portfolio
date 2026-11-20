# CP Translation Calibration Examples

Real pairs from `src/content/blog/parallel-binary-search-vi.md` and
`src/content/blog/parallel-binary-search.md`. Use these to calibrate register
and faithfulness before translating.

## 1. Preserving Conditional Framing & Natural CP Phrasing

**Vietnamese:**
> Thông thường những bài toán mà ta có thể áp dụng tìm kiếm nhị phân để tìm kết quả cho từng truy vấn riêng biệt và để trả lời hết $Q$ truy vấn ta áp dụng việc tìm kiếm trên $Q$ lần (thông thường sẽ TLE) thì kỹ thuật tìm kiếm nhị phân song song sẽ giúp ta giảm độ phức tạp của việc tìm kiếm trên.

**Avoid (drops conditional, hyphenates "binary-search"):**
> Usually, we can binary-search the answer to each query independently. To answer all $Q$ queries, we run binary search $Q$ times, which usually results in TLE. Parallel binary search processes the queries together and reduces the complexity of this approach.

**Preferred:**
> Typically, in problems where we can binary search for the answer to each query independently, answering all $Q$ queries requires running binary search $Q$ times (which usually results in TLE). Parallel binary search helps reduce the complexity of this search.

*Why:* Preserves the conditional ("in problems where..."), uses standard CP phrasing (`binary search`, `results in TLE`), and does not invent claims.

---

## 2. Avoiding Editorial / AI-Slop Rewrites

**Vietnamese:**
> Vậy đâu là điểm mà ta có thể tối ưu? Giả sử ta đang thực hiện việc tìm kiếm nhị phân trong đoạn $[l, r]$ (dùng $mid$ con đường đầu tiên, trong đó $mid = \frac{l + r}{2}$), có thể thấy nếu tìm kiếm nhị phân các truy vấn một cách riêng biệt thì với một giá trị $mid$ cụ thể ta đã phải xây dựng đi, xây dựng lại nhiều lần. Do đó ta sẽ nghĩ đến việc nhóm tất cả những truy vấn có cùng khoảng tìm kiếm $[l, r]$ và trả lời một cách đồng thời.

**Avoid (editorial hook + invented phrasing):**
> Where is the waste? Suppose a query is searching the range $[l, r]$ and $mid = \frac{l + r}{2}$. The check builds the first $mid$ roads, and every query that reaches this $mid$ needs the same prefix of roads. Run separately, that prefix gets built over and over. So we group the queries that share a search range $[l, r]$ and answer each group at once.

**Preferred:**
> So where can we optimize? Suppose we are binary searching on the range $[l, r]$ (using the first $mid$ roads, where $mid = \frac{l + r}{2}$). Notice that if we binary search each query independently, for a specific value of $mid$ we end up rebuilding it over and over again. So a natural idea is to group all queries with the same search range $[l, r]$ and answer them simultaneously.

*Why:* Keeps the author's exact question ("So where can we optimize?") and reasoning without adding extra phrases ("prefix of roads") or journalistic punchlines ("Where is the waste?").

---

## 3. Avoiding Choppy Literal Sentences (Problem Summary)

**Vietnamese:**
> Có $K$ sự kiện xảy ra tuần tự. Mỗi sự kiện được miêu tả bởi ba giá trị $l_i, r_i, x_i$ có nghĩa các vùng đất từ $l_i$ đến $r_i$ sẽ tạo ra lượng tài nguyên $x_i$ ($l_i$ có thể lớn hơn $r_i$ vì các vùng đất xếp theo vòng tròn) và chủ sở hữu của vùng đất sẽ nhận được lượng tài nguyên vùng đất tạo ra. Nói cách khác, nếu người nông dân có $c$ vùng đất trong đoạn $[l_i, r_i]$ thì sẽ nhận được lượng tài nguyên $cx_i$. Với mỗi người nông dân, hãy cho biết sự kiện đầu tiên người nông dân đạt được ngưỡng tài nguyên mong muốn.

**Avoid (choppy STE-like sentences, repeated noun):**
> There are $K$ events in chronological order. Each event is described by three values $l_i, r_i, x_i$. It means that the areas from $l_i$ to $r_i$ produce $x_i$ resources. The value $l_i$ can be greater than $r_i$ because the areas are arranged in a circle. The owner of an area receives the resources that the area produces. In other words, if a farmer owns $c$ areas in $[l_i, r_i]$, the farmer receives $cx_i$ resources. For each farmer, find the first event at which the farmer reaches the target resource value.

**Preferred:**
> There are $K$ events occurring in order, each described by three values $l_i, r_i, x_i$, meaning that the plots from $l_i$ to $r_i$ each produce $x_i$ resources ($l_i$ can be greater than $r_i$ since the plots are arranged in a circle), and the owner of each plot receives the resources it produces. In other words, if a farmer owns $c$ plots in the range $[l_i, r_i]$, they receive $cx_i$ resources. For each farmer, find the first event at which they reach their target amount of resources.

*Why:* Smooth sentence flow matching the Vietnamese clause structure, natural English pronouns ("they"), and domain-appropriate noun ("plots" matching `lands` in the C++ code).

---

## 4. Standard CP Terms & Preserving Qualifiers

**Vietnamese:**
> **Độ phức tạp:** độ phức tạp sau khi tối ưu là $\mathcal{O}((K + M)\log{M}\log{K})$.

**Avoid (drops "sau khi tối ưu"):**
> **Complexity:** The time complexity is $\mathcal{O}((K + M)\log{M}\log{K})$.

**Preferred:**
> **Complexity:** After optimization, the time complexity is $\mathcal{O}((K + M)\log{M}\log{K})$.

---

## 5. Solution Bullet Formatting & Space Complexity

**Vietnamese:**
> - **Cập nhật một sự kiện:** ta sẽ đại diện mỗi phần tử $A_i$ bởi một bộ bốn số $(i, value, t, delta)$ với ý nghĩa sau thời gian $t, A_i = value$ và $delta = -1 \; \text{hoặc} \; 1$.
> - **Độ phức tạp bộ nhớ:** $\mathcal{O}((N + Q)\log(N + Q))$ hoặc $\mathcal{O}(N + Q)$ nếu giải phóng bộ nhớ của các mảng $events$ và $queries$ như cách cài đặt trên.

**Avoid (imperative label, literal phrasing):**
> - **Update an event:** Represent each element $A_i$ by a tuple $(i, value, t, delta)$. The tuple means that after time $t$, $A_i = value$, and $delta = -1 \; \text{or} \; 1$.
> - Memory complexity: $\mathcal{O}((N + Q)\log(N + Q))$, or $\mathcal{O}(N + Q)$ if we release the `events` and `queries` arrays as in the implementation above.

**Preferred:**
> - **Updating an event:** We represent each element $A_i$ as a 4-tuple $(i, value, t, delta)$, meaning that after time $t$, $A_i = value$ with $delta = -1 \; \text{or} \; 1$.
> - Space complexity: $\mathcal{O}((N + Q)\log(N + Q))$, or $\mathcal{O}(N + Q)$ if we free the memory of the `events` and `queries` vectors as in the implementation above.

*Why:* Gerund labels fit operation-type lists naturally; "4-tuple", "Space complexity", and "free the memory of the `events` and `queries` vectors" match standard C++ CP terminology.

---

## 6. Mathematical Accuracy (`chia lấy dư` ≠ "divide by")

From `src/content/blog/xor-basis-vi.md` and `src/content/blog/xor-basis.md`.

**Vietnamese:**
> $\mathbb{Z}_2$: $\mathbb{Z}_m$ là tập các số dư khi chia lấy dư cho $m$ và các phép toán trên $\mathbb{Z}_m$ cũng chia lấy dư cho $m$. Suy ra $\mathbb{Z}_2$ là tập các số dư khi chia lấy dư cho $2$ do đó $\mathbb{Z}_2 = \{0, 1\}$.

**Avoid (wrong math — mistranslates `chia lấy dư` as division):**
> $\mathbb{Z}_2$: $\mathbb{Z}_m$ is the set of residues when dividing by $m$, and the operations on $\mathbb{Z}_m$ also divide by $m$. So $\mathbb{Z}_2$ is the set of residues when dividing by $2$, hence $\mathbb{Z}_2 = \{0, 1\}$.

**Preferred:**
> $\mathbb{Z}_2$: $\mathbb{Z}_m$ is the set of remainders upon division by $m$, and operations on $\mathbb{Z}_m$ are also taken modulo $m$. Therefore, $\mathbb{Z}_2$ is the set of remainders modulo $2$, so $\mathbb{Z}_2 = \{0, 1\}$.

*Why:* `chia lấy dư cho m` means "taken modulo $m$" (remainder upon division), never "divide by $m$". Always verify math statements after translating.

---

## 7. Linear Algebra Register & Subarray vs. Subsequence

**Vietnamese:**
> Đây là một kỹ thuật được dùng để giải quyết một số bài toán có liên quan đến tổng xor của đoạn con (liên tiếp hoặc không liên tiếp) của mảng các số nguyên cho trước hoặc thêm phần tử vào mảng song song với việc truy vấn.
>
> Một tập $V \ne \varnothing$ được gọi là một không gian vector nếu $V$ được trang bị hai phép toán: phép cộng và phép nhân với một vô hướng.

**Avoid (imprecise CP term, non-standard linear algebra phrasing, lowercase `xor`):**
> The xor basis is a technique for problems about the xor sum of subarrays (contiguous or not) of an array of integers, or about appending elements to an array while answering queries.
>
> A set $V \ne \varnothing$ is a vector space if $V$ carries two operations: addition and multiplication by a scalar.

**Preferred:**
> XOR basis is a technique for solving problems involving the XOR sum of subarrays or subsequences (contiguous or non-contiguous) of a given integer array, or inserting elements into an array while answering queries.
>
> A set $V \ne \varnothing$ is called a vector space if $V$ is equipped with two operations: addition and scalar multiplication.

*Why:* In English CP, "subarray" implies contiguous, whereas "subsequence"/"subset" allows non-contiguous elements. Standard linear algebra uses "equipped with", "scalar multiplication", and uppercase `XOR`.
