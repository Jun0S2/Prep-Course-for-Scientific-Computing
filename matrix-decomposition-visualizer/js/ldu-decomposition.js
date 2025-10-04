class LDUDecomposition {
    static state = {
        N: 3,
        A: [], L: [], D: [], U: [],
        step: 0, currentCol: 0, currentRow: 1
    };

    static getHTML() {
        return `
            <h2>LDU Decomposition</h2>
            <div class="matrix-controls">
                <label>Size: <input type="number" id="ldu-size" value="3" min="2" max="6"></label>
                <button class="btn" onclick="LDUDecomposition.generate()">Generate Matrix</button>
                <button class="btn" onclick="LDUDecomposition.nextStep()">Next Step</button>
                <button class="btn btn-secondary" onclick="LDUDecomposition.reset()">Reset</button>
            </div>

            <div class="legend">
                <div class="legend-item"><div class="legend-color pivot"></div><span>Pivot Element</span></div>
                <div class="legend-item"><div class="legend-color updating"></div><span>Currently Updating</span></div>
                <div class="legend-item"><div class="legend-color eigen-value"></div><span>Diagonal Element</span></div>
            </div>

            <div class="matrix-row">
                <div class="matrix-container">
                    <h4>Matrix A</h4>
                    <div id="ldu-matrix-a"></div>
                </div>
            </div>
            <div class="matrix-row">
                <div class="matrix-container">
                    <h4>Lower Triangular L</h4>
                    <div id="ldu-matrix-l"></div>
                </div>
                <div class="matrix-container">
                    <h4>Diagonal D</h4>
                    <div id="ldu-matrix-d"></div>
                </div>
                <div class="matrix-container">
                    <h4>Upper Triangular U</h4>
                    <div id="ldu-matrix-u"></div>
                </div>
            </div>

            <div class="description" id="ldu-description"></div>
        `;
    }

    static initialize() {
        this.generate();
    }

    static generate() {
        this.state.N = parseInt(document.getElementById('ldu-size').value);
        this.state.A = MatrixUtils.generateRandomMatrix(this.state.N, this.state.N);
        this.state.L = MatrixUtils.createIdentityMatrix(this.state.N);
        this.state.D = MatrixUtils.createZeroMatrix(this.state.N, this.state.N);
        this.state.U = MatrixUtils.createIdentityMatrix(this.state.N);
        this.state.step = 0;
        this.state.currentCol = 0;
        this.state.currentRow = 1;

        // LU 분해 먼저 수행 (간소화)
        this.performLU();
        this.extractD();
        
        this.updateDisplay();
        this.updateDescription(`
            <h3>LDU Decomposition: A = L × D × U</h3>
            <div class="formula">
                A = L × D × U
            </div>
            <div class="info-box">
                <strong>Key Concepts:</strong>
                <ul>
                    <li><strong>L</strong>: Unit lower triangular (1's on diagonal)</li>
                    <li><strong>D</strong>: Diagonal matrix</li>
                    <li><strong>U</strong>: Unit upper triangular (1's on diagonal)</li>
                    <li>More explicit than LU decomposition</li>
                    <li>Useful for symmetric matrices</li>
                </ul>
            </div>
        `);
    }

    static performLU() {
        const tempA = this.state.A.map(row => [...row]);
        const tempL = MatrixUtils.createIdentityMatrix(this.state.N);
        
        for (let col = 0; col < this.state.N - 1; col++) {
            for (let row = col + 1; row < this.state.N; row++) {
                const multiplier = tempA[row][col] / tempA[col][col];
                tempL[row][col] = multiplier;
                
                for (let j = col; j < this.state.N; j++) {
                    tempA[row][j] -= multiplier * tempA[col][j];
                }
            }
        }
        
        // L과 U 추출
        for (let i = 0; i < this.state.N; i++) {
            for (let j = 0; j < this.state.N; j++) {
                if (i > j) this.state.L[i][j] = tempL[i][j];
                else if (i === j) this.state.U[i][j] = tempA[i][j] / tempA[i][i];
                else this.state.U[i][j] = tempA[i][j] / tempA[i][i];
            }
        }
    }

    static extractD() {
        for (let i = 0; i < this.state.N; i++) {
            this.state.D[i][i] = this.state.A[i][i];
            for (let k = 0; k < i; k++) {
                this.state.D[i][i] -= this.state.L[i][k] * this.state.D[k][k] * this.state.U[k][i];
            }
        }
    }

    static nextStep() {
        // 단계별 시뮬레이션 (간소화)
        this.updateDescription(`
            <h3>LDU Decomposition Complete!</h3>
            <div class="formula">
                A = L × D × U
            </div>
            <div class="info-box">
                <strong>Verification:</strong> Multiply L × D × U to verify it equals original matrix A.
            </div>
        `);
    }

    static reset() {
        this.generate();
    }

    static updateDisplay() {
        document.getElementById('ldu-matrix-a').innerHTML = 
            MatrixUtils.createTable(this.state.A);
        document.getElementById('ldu-matrix-l').innerHTML = 
            MatrixUtils.createTable(this.state.L);
        document.getElementById('ldu-matrix-d').innerHTML = 
            MatrixUtils.createTable(this.state.D, { specialType: 'eigen' });
        document.getElementById('ldu-matrix-u').innerHTML = 
            MatrixUtils.createTable(this.state.U);
    }

    static updateDescription(html) {
        document.getElementById('ldu-description').innerHTML = html;
    }
}