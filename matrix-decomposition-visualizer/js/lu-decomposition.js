class LUDecomposition {
    static state = {
        N: 3,
        A: [], L: [], U: [],
        step: 0, currentCol: 0, currentRow: 1,
        phase: 'LU'
    };

    static getHTML() {
        return `
            <h2>LU Decomposition</h2>
            <div class="matrix-controls">
                <label>Size: <input type="number" id="lu-size" value="3" min="2" max="6"></label>
                <button class="btn" onclick="LUDecomposition.generate()">Generate Matrix</button>
                <button class="btn" onclick="LUDecomposition.nextStep()">Next Step</button>
                <button class="btn btn-secondary" onclick="LUDecomposition.reset()">Reset</button>
            </div>

            <div class="legend">
                <div class="legend-item"><div class="legend-color pivot"></div><span>Pivot Element</span></div>
                <div class="legend-item"><div class="legend-color updating"></div><span>Currently Updating</span></div>
                <div class="legend-item"><div class="legend-color filled"></div><span>Completed</span></div>
                <div class="legend-item"><div class="legend-color used"></div><span>Used in Calculation</span></div>
            </div>

            <div class="matrix-row">
                <div class="matrix-container">
                    <h4>Matrix A</h4>
                    <div id="lu-matrix-a"></div>
                </div>
                <div class="matrix-container">
                    <h4>Lower Triangular L</h4>
                    <div id="lu-matrix-l"></div>
                </div>
                <div class="matrix-container">
                    <h4>Upper Triangular U</h4>
                    <div id="lu-matrix-u"></div>
                </div>
            </div>

            <div class="description" id="lu-description"></div>
        `;
    }

    static initialize() {
        this.generate();
    }

    static generate() {
        this.state.N = parseInt(document.getElementById('lu-size').value);
        this.state.A = MatrixUtils.generateRandomMatrix(this.state.N, this.state.N);
        this.state.L = MatrixUtils.createIdentityMatrix(this.state.N);
        this.state.U = this.state.A.map(row => [...row]);
        this.state.step = 0;
        this.state.currentCol = 0;
        this.state.currentRow = 1;
        this.state.phase = 'LU';

        this.updateDisplay();
        this.updateDescription(`
            <h3>LU Decomposition: A = L × U</h3>
            <div class="formula">
                A = L × U
            </div>
            <div class="info-box">
                <strong>Key Concepts:</strong>
                <ul>
                    <li><strong>L</strong>: Lower triangular matrix with 1's on diagonal</li>
                    <li><strong>U</strong>: Upper triangular matrix</li>
                    <li>Used for solving linear systems, matrix inversion</li>
                    <li>Computational complexity: O(n³)</li>
                </ul>
            </div>
            <p>We'll perform Gaussian elimination to transform A into U while recording multipliers in L.</p>
        `);
    }

    static nextStep() {
        if (this.state.currentCol >= this.state.N - 1) {
            this.updateDescription(`
                <h3>LU Decomposition Completed!</h3>
                <div class="formula">A = L × U</div>
                <div class="info-box">
                    <strong>Verification:</strong> Multiply L and U to get back original matrix A.
                </div>
            `);
            return;
        }

        const pivotElement = this.state.U[this.state.currentCol][this.state.currentCol];
        const multiplier = this.state.U[this.state.currentRow][this.state.currentCol] / pivotElement;

        const highlight = [[this.state.currentRow, this.state.currentCol]];
        const pivot = [[this.state.currentCol, this.state.currentCol]];
        const used = [];

        for (let j = this.state.currentCol; j < this.state.N; j++) {
            this.state.U[this.state.currentRow][j] -= multiplier * this.state.U[this.state.currentCol][j];
            highlight.push([this.state.currentRow, j]);
            if (j > this.state.currentCol) {
                used.push([this.state.currentCol, j]);
            }
        }

        this.state.L[this.state.currentRow][this.state.currentCol] = multiplier;

        this.updateDisplay(highlight, pivot, used);

        this.updateDescription(`
            <h3>Step ${this.state.step + 1}: Eliminating element at (${this.state.currentRow}, ${this.state.currentCol})</h3>
            <div class="formula">
                Pivot: U[${this.state.currentCol},${this.state.currentCol}] = ${MatrixUtils.format(pivotElement)}<br>
                Multiplier: L[${this.state.currentRow},${this.state.currentCol}] = ${MatrixUtils.format(multiplier)}<br>
                Update: U[${this.state.currentRow},j] = U[${this.state.currentRow},j] - ${MatrixUtils.format(multiplier)} × U[${this.state.currentCol},j]
            </div>
        `);

        this.state.currentRow++;
        if (this.state.currentRow >= this.state.N) {
            this.state.currentCol++;
            this.state.currentRow = this.state.currentCol + 1;
        }
        this.state.step++;
    }

    static reset() {
        this.generate();
    }

    static updateDisplay(highlight = [], pivot = [], used = []) {
        document.getElementById('lu-matrix-a').innerHTML = 
            MatrixUtils.createTable(this.state.A);
        document.getElementById('lu-matrix-l').innerHTML = 
            MatrixUtils.createTable(this.state.L, { highlight, pivot, used });
        document.getElementById('lu-matrix-u').innerHTML = 
            MatrixUtils.createTable(this.state.U, { highlight, pivot, used });
    }

    static updateDescription(html) {
        document.getElementById('lu-description').innerHTML = html;
    }
}