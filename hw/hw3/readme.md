English version of this document can be found in [here](./readme_en.md)

# LU 분해 및 선형 시스템 솔버 시각화 도구

## 개요

> 선형대수학의 핵심 개념을 시각적으로 이해하는 데 도움을 주도록 설계 + 피벗팅의 필요성과 작동 방식을 명확히 보여주기 위해 개발

## 주요 기능

### 1. LU 분해 (LU Factorization Only)

- 행렬 A를 하삼각행렬 L과 상삼각행렬 U로 분해하는 과정 시각화
- 가우스 소거법을 통한 분해 과정 단계별演示

### 2. 선형 시스템 풀이 (Solve Ax=b)

- LU 분해를 활용한 선형 방정식 시스템 풀이
- 순방향 대입(Forward substitution)과 역방향 대입(Backward substitution) 과정 포함

### 3. 부분 피벗팅을 사용한 LU 분해 (LU with Pivoting)

- 수치적 안정성을 위한 부분 피벗팅 구현
- 행 교환 과정과 순열 행렬 P의 역할 시각화

## 핵심 개념 설명

### LU 분해 (LU Factorization)

**LU 분해**는 정방행렬 A를 하삼각행렬 L과 상삼각행렬 U의 곱으로 분해하는 방법입니다:

```
A = L × U
```

- **L (Lower triangular matrix)**: 주대각선 요소가 1인 하삼각행렬
- **U (Upper triangular matrix)**: 상삼각행렬

**알고리즘 단계:**

1. 행렬 U를 A로 초기화, L을 단위행렬로 초기화
2. 각 열마다 피벗 요소 선택
3. 피벗 아래 요소들을 0으로 만들며 승수 계산
4. 승수를 L 행렬에 저장

### 선형 시스템 풀이 (Solving Ax=b)

LU 분해를 이용하면 선형 시스템을 효율적으로 풀 수 있습니다:

```
Ax = b  →  (LU)x = b  →  L(Ux) = b
```

**두 단계로 풀이:**

1. **순방향 대입 (Forward Substitution)**: Ly = b 풀기
2. **역방향 대입 (Backward Substitution)**: Ux = y 풀기

### 피벗팅 (Pivoting)

**피벗팅**은 수치적 안정성을 높이기 위한 기술로, 두 가지 주요 문제를 해결합니다:

1. **0으로 나누기 방지**: 피벗 요소가 0인 경우
2. **반올림 오류 감소**: 매우 작은 피벗 요소로 인한 오류 방지

**부분 피벗팅 알고리즘:**

```
PA = LU
```

- P: 순열 행렬 (행 교환 기록)
- 각 열에서 가장 큰 절대값을 가진 요소를 피벗으로 선택
- 필요시 행 교환 수행

## 코드 알고리즘 상세 설명

### 데이터 구조

```javascript
let N = 3; // 행렬 크기
let A = []; // 원본 행렬
let L = []; // 하삼각행렬 (초기값: 단위행렬)
let U = []; // 상삼각행렬 (초기값: A와 동일)
let P = []; // 순열 행렬 (피벗팅에서 사용)
let b = [],
  x = [],
  y = []; // 벡터 (선형 시스템 풀이에서 사용)
```

### 상태 관리 변수

```javascript
let step = 0; // 현재 단계 번호
let phase = "LU"; // 현재 진행 단계 (LU, Forward, Backward)
let currentCol = 0; // 현재 처리 중인 열
let currentRow = 1; // 현재 처리 중인 행
let pivotPhase = "findPivot"; // 피벗팅 단계 관리
```

### 핵심 알고리즘 구현

#### 1. 피벗팅이 포함된 LU 분해 알고리즘

```javascript
function nextStepPivot() {
  if (currentCol >= N - 1) {
    // 완료 처리
    return;
  }

  if (pivotPhase === "findPivot") {
    // 피벗 찾기 단계
    let maxRow = currentCol;
    let maxVal = Math.abs(U[currentCol][currentCol]);

    // 현재 열에서 가장 큰 절대값 찾기
    for (let i = currentCol + 1; i < N; i++) {
      if (Math.abs(U[i][currentCol]) > maxVal) {
        maxVal = Math.abs(U[i][currentCol]);
        maxRow = i;
      }
    }

    if (maxRow !== currentCol) {
      pivotPhase = "swapRows"; // 교환 필요
    } else {
      pivotPhase = "eliminate"; // 교환 불필요
    }
  } else if (pivotPhase === "swapRows") {
    // 행 교환 단계
    let maxRow = currentCol;
    let maxVal = Math.abs(U[currentCol][currentCol]);

    // 다시 최대값 위치 확인
    for (let i = currentCol + 1; i < N; i++) {
      if (Math.abs(U[i][currentCol]) > maxVal) {
        maxVal = Math.abs(U[i][currentCol]);
        maxRow = i;
      }
    }

    if (maxRow !== currentCol) {
      // U 행렬 행 교환
      [U[currentCol], U[maxRow]] = [U[maxRow], U[currentCol]];

      // L 행렬의 이미 계산된 승수들 교환
      for (let j = 0; j < currentCol; j++) {
        [L[currentCol][j], L[maxRow][j]] = [L[maxRow][j], L[currentCol][j]];
      }

      // P 행렬 행 교환
      [P[currentCol], P[maxRow]] = [P[maxRow], P[currentCol]];
    }

    pivotPhase = "eliminate";
  } else if (pivotPhase === "eliminate") {
    // 소거 단계
    let pivotElement = U[currentCol][currentCol];
    let multiplier = U[currentRow][currentCol] / pivotElement;

    // 현재 행 소거
    for (let j = currentCol; j < N; j++) {
      U[currentRow][j] = U[currentRow][j] - multiplier * U[currentCol][j];
    }

    // 승수 저장
    L[currentRow][currentCol] = multiplier;

    // 다음 행으로 이동
    currentRow++;
    if (currentRow >= N) {
      currentCol++;
      currentRow = currentCol + 1;
      pivotPhase = "findPivot"; // 다음 열로 이동
    }
  }

  step++;
}
```

#### 2. 의사코드(Pseudocode) 비교

**기본 LU 분해:**

```python
for k in range(0, n-1):
    for i in range(k+1, n):
        # 승수 계산
        L[i][k] = U[i][k] / U[k][k]

        # 행 소거
        for j in range(k, n):
            U[i][j] = U[i][j] - L[i][k] * U[k][j]
```

**피벗팅이 포함된 LU 분해:**

```python
for k in range(0, n-1):
    # 피벗 찾기 (한 번!)
    max_row = find_max_pivot(U, k)

    # 필요하면 교체 (한 번!)
    if max_row != k:
        swap_rows(U, k, max_row)
        swap_rows(L, k, max_row)
        swap_rows(P, k, max_row)

    # 소거 수행
    for i in range(k+1, n):
        L[i][k] = U[i][k] / U[k][k]
        for j in range(k, n):
            U[i][j] = U[i][j] - L[i][k] * U[k][j]
```

#### 3. 선형 시스템 풀이 알고리즘

```javascript
function nextStepSolve() {
  if (phase === "LU") {
    // LU 분해 단계
    // ... (위의 LU 분해 알고리즘과 동일)
  } else if (phase === "Forward") {
    // 순방향 대입: Ly = b
    let sum = 0;
    for (let j = 0; j < step; j++) {
      sum += L[step][j] * y[j];
    }
    y[step] = (b[step] - sum) / L[step][step];
    step++;
  } else if (phase === "Backward") {
    // 역방향 대입: Ux = y
    let i = N - 1 - step;
    let sum = 0;
    for (let j = i + 1; j < N; j++) {
      sum += U[i][j] * x[j];
    }
    x[i] = (y[i] - sum) / U[i][i];
    step++;
  }
}
```

### 주요 함수 상세

#### 1. `createTable()` - 시각화 함수

```javascript
function createTable(
  matrix,
  highlight = [],
  pivot = [],
  used = [],
  swapped = [],
  candidates = [],
  isVector = false
) {
  // 다양한 색상으로 현재 상태 하이라이트:
  // - pivot: 파란색 (피벗 요소)
  // - updating: 노란색 (현재 업데이트 중)
  // - swapped: 주황색 (교환된 행)
  // - pivot-candidate: 연두색 (피벗 후보)
  // - used: 회색 (계산에 사용됨)
  // - filled: 연한 초록색 (완료됨)
}
```

#### 2. 행렬 초기화 함수

```javascript
function initializePivot() {
  // P를 단위행렬로 초기화
  for (let i = 0; i < N; i++) {
    P[i] = [];
    for (let j = 0; j < N; j++) {
      P[i][j] = i === j ? 1 : 0;
    }
  }

  // A, L, U 초기화
  for (let i = 0; i < N; i++) {
    A[i] = [];
    L[i] = [];
    U[i] = [];
    for (let j = 0; j < N; j++) {
      let val = Math.floor(Math.random() * 10) + 1;
      A[i][j] = val;
      U[i][j] = val;
      L[i][j] = i === j ? 1 : 0; // L은 단위행렬로 시작
    }
  }
}
```

## 알고리즘 복잡도 분석

- **LU 분해**: O(n³)
- **순방향 대입**: O(n²)
- **역방향 대입**: O(n²)
- **피벗 탐색**: O(n) (각 열마다)

## 수치적 안정성 고려사항

1. **피벗팅의 중요성**: 작은 피벗 요소는 큰 승수를 만들어 반올림 오류를 증폭시킴
2. **부분 피벗팅**: 각 열에서 가장 큰 절대값을 가진 요소를 선택하여 안정성 보장
3. **완전 피벗팅**: 행과 열 모두에서 피벗 선택 (더 복잡하지만 더 안정적)

## 사용 방법

1. **행렬 크기 선택** (2×2에서 6×6까지)
2. **모드 선택**:
   - LU 분해만 보기
   - 선형 시스템 풀이 전체 과정 보기
   - 피벗팅이 포함된 LU 분해 보기
3. **Next Step** 버튼으로 단계별 진행
4. 각 단계의 설명문을 통해 알고리즘 이해
