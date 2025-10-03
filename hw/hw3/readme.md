pivoting

```
for k in range(0, n-1):
    # 피벗 찾기 (한 번!)
    max_row = find_max_pivot(U, k)

    # 필요하면 교체 (한 번!)
    if max_row != k:
        swap_rows(U, k, max_row)
        swap_rows(L, k, max_row)
        swap_rows(P, k, max_row)

    # 소거 진행
    for i in range(k+1, n):
        # ...
```
