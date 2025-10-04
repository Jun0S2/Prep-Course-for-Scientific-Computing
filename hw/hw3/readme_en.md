# LU Factorization and Linear System Solver Visualizer

## Overview

> Designed to help understand core linear algebra concepts visually + Developed to clearly demonstrate the necessity and operation of pivoting

## Key Features

### 1. LU Factorization Only

- Visualizes the process of decomposing matrix A into lower triangular matrix L and upper triangular matrix U
- Step-by-step demonstration of the decomposition process using Gaussian elimination

### 2. Solve Ax=b

- Solves linear equation systems using LU factorization
- Includes forward substitution and backward substitution processes

### 3. LU with Partial Pivoting

- Implements partial pivoting for numerical stability
- Visualizes row swapping process and the role of permutation matrix P

## Core Concepts Explained

### LU Factorization

**LU Factorization** is a method that decomposes a square matrix A into the product of a lower triangular matrix L and an upper triangular matrix U:

```
A = L × U
```

- **L (Lower triangular matrix)**: Lower triangular matrix with 1's on the main diagonal
- **U (Upper triangular matrix)**: Upper triangular matrix

**Algorithm Steps:**

1. Initialize matrix U as A, and L as identity matrix
2. Select pivot element for each column
3. Eliminate elements below pivot while calculating multipliers
4. Store multipliers in L matrix

### Solving Linear Systems (Ax=b)

Using LU factorization, linear systems can be solved efficiently:

```
Ax = b  →  (LU)x = b  →  L(Ux) = b
```

**Solved in two steps:**

1. **Forward Substitution**: Solve Ly = b for y
2. **Backward Substitution**: Solve Ux = y for x

### Pivoting

**Pivoting** is a technique to improve numerical stability, solving two main problems:

1. **Prevent division by zero**: When pivot element is 0
2. **Reduce rounding errors**: When pivot element is very small

**Partial Pivoting Algorithm:**

```
PA = LU
```

- P: Permutation matrix (records row swaps)
- Select element with largest absolute value in each column as pivot
- Perform row swaps when necessary

## Detailed Code Algorithm Explanation

### Data Structure

```javascript
let N = 3; // Matrix size
let A = []; // Original matrix
let L = []; // Lower triangular matrix (initial: identity matrix)
let U = []; // Upper triangular matrix (initial: same as A)
let P = []; // Permutation matrix (used in pivoting)
let b = [],
  x = [],
  y = []; // Vectors (used in linear system solving)
```

### State Management Variables

```javascript
let step = 0; // Current step number
let phase = "LU"; // Current phase (LU, Forward, Backward)
let currentCol = 0; // Currently processing column
let currentRow = 1; // Currently processing row
let pivotPhase = "findPivot"; // Pivoting phase management
```

### Core Algorithm Implementation

#### 1. LU Factorization Algorithm with Pivoting

```javascript
function nextStepPivot() {
  if (currentCol >= N - 1) {
    // Completion handling
    return;
  }

  if (pivotPhase === "findPivot") {
    // Pivot finding phase
    let maxRow = currentCol;
    let maxVal = Math.abs(U[currentCol][currentCol]);

    // Find largest absolute value in current column
    for (let i = currentCol + 1; i < N; i++) {
      if (Math.abs(U[i][currentCol]) > maxVal) {
        maxVal = Math.abs(U[i][currentCol]);
        maxRow = i;
      }
    }

    if (maxRow !== currentCol) {
      pivotPhase = "swapRows"; // Swap required
    } else {
      pivotPhase = "eliminate"; // No swap needed
    }
  } else if (pivotPhase === "swapRows") {
    // Row swapping phase
    let maxRow = currentCol;
    let maxVal = Math.abs(U[currentCol][currentCol]);

    // Reconfirm maximum value position
    for (let i = currentCol + 1; i < N; i++) {
      if (Math.abs(U[i][currentCol]) > maxVal) {
        maxVal = Math.abs(U[i][currentCol]);
        maxRow = i;
      }
    }

    if (maxRow !== currentCol) {
      // Swap rows in U matrix
      [U[currentCol], U[maxRow]] = [U[maxRow], U[currentCol]];

      // Swap already calculated multipliers in L matrix
      for (let j = 0; j < currentCol; j++) {
        [L[currentCol][j], L[maxRow][j]] = [L[maxRow][j], L[currentCol][j]];
      }

      // Swap rows in P matrix
      [P[currentCol], P[maxRow]] = [P[maxRow], P[currentCol]];
    }

    pivotPhase = "eliminate";
  } else if (pivotPhase === "eliminate") {
    // Elimination phase
    let pivotElement = U[currentCol][currentCol];
    let multiplier = U[currentRow][currentCol] / pivotElement;

    // Eliminate current row
    for (let j = currentCol; j < N; j++) {
      U[currentRow][j] = U[currentRow][j] - multiplier * U[currentCol][j];
    }

    // Store multiplier
    L[currentRow][currentCol] = multiplier;

    // Move to next row
    currentRow++;
    if (currentRow >= N) {
      currentCol++;
      currentRow = currentCol + 1;
      pivotPhase = "findPivot"; // Move to next column
    }
  }

  step++;
}
```

#### 2. Pseudocode Comparison

**Basic LU Factorization:**

```python
for k in range(0, n-1):
    for i in range(k+1, n):
        # Multiplier calculation
        L[i][k] = U[i][k] / U[k][k]

        # Row elimination
        for j in range(k, n):
            U[i][j] = U[i][j] - L[i][k] * U[k][j]
```

**LU Factorization with Pivoting:**

```python
for k in range(0, n-1):
    # Find pivot (once!)
    max_row = find_max_pivot(U, k)

    # Swap if necessary (once!)
    if max_row != k:
        swap_rows(U, k, max_row)
        swap_rows(L, k, max_row)
        swap_rows(P, k, max_row)

    # Perform elimination
    for i in range(k+1, n):
        L[i][k] = U[i][k] / U[k][k]
        for j in range(k, n):
            U[i][j] = U[i][j] - L[i][k] * U[k][j]
```

#### 3. Linear System Solving Algorithm

```javascript
function nextStepSolve() {
  if (phase === "LU") {
    // LU factorization phase
    // ... (same as LU factorization algorithm above)
  } else if (phase === "Forward") {
    // Forward substitution: Ly = b
    let sum = 0;
    for (let j = 0; j < step; j++) {
      sum += L[step][j] * y[j];
    }
    y[step] = (b[step] - sum) / L[step][step];
    step++;
  } else if (phase === "Backward") {
    // Backward substitution: Ux = y
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

### Key Function Details

#### 1. `createTable()` - Visualization Function

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
  // Highlight current state with various colors:
  // - pivot: Blue (pivot element)
  // - updating: Yellow (currently updating)
  // - swapped: Orange (swapped rows)
  // - pivot-candidate: Light green (pivot candidates)
  // - used: Gray (used in calculation)
  // - filled: Light green (completed)
}
```

#### 2. Matrix Initialization Function

```javascript
function initializePivot() {
  // Initialize P as identity matrix
  for (let i = 0; i < N; i++) {
    P[i] = [];
    for (let j = 0; j < N; j++) {
      P[i][j] = i === j ? 1 : 0;
    }
  }

  // Initialize A, L, U
  for (let i = 0; i < N; i++) {
    A[i] = [];
    L[i] = [];
    U[i] = [];
    for (let j = 0; j < N; j++) {
      let val = Math.floor(Math.random() * 10) + 1;
      A[i][j] = val;
      U[i][j] = val;
      L[i][j] = i === j ? 1 : 0; // L starts as identity matrix
    }
  }
}
```

## Algorithm Complexity Analysis

- **LU Factorization**: O(n³)
- **Forward Substitution**: O(n²)
- **Backward Substitution**: O(n²)
- **Pivot Search**: O(n) (for each column)

## Numerical Stability Considerations

1. **Importance of Pivoting**: Small pivot elements create large multipliers that amplify rounding errors
2. **Partial Pivoting**: Selects element with largest absolute value in each column to ensure stability
3. **Complete Pivoting**: Selects pivot from both rows and columns (more complex but more stable)

## Usage Instructions

1. **Select Matrix Size** (from 2×2 to 6×6)
2. **Choose Mode**:
   - LU Factorization Only
   - Complete Linear System Solving
   - LU with Partial Pivoting
3. **Click Next Step** to proceed step by step
4. **Read descriptions** at each step to understand the algorithm

## Technical Implementation Notes

### Color Coding System

- **Blue**: Pivot element currently being used
- **Yellow**: Element currently being updated
- **Orange**: Rows that have been swapped
- **Light Green**: Pivot candidates being considered
- **Gray**: Elements used in current calculation
- **Pale Green**: Completed elements

### Step Management

The algorithm maintains precise control over the execution flow through state variables, ensuring that each step is clearly demonstrated and explained to the user.

### Error Handling

The visualization includes warnings and explanations for problematic scenarios like small pivots or potential numerical instability issues.
