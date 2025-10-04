class QRDecomposition {
    static state = {
        N: 3,
        A: [], Q: [], R: [],
        step: 0, currentCol: 0
    };

    static getHTML() {
        return `
            <h2>QR Decomposition</h2>
            <div class="matrix-controls">
                <label>Size: <input type="number" id="qr-size" value="3" min="2" max="6"></label>
                <button class="btn" onclick="QRDecomposition.generate()">Generate Matrix</button>
                <button class="btn" onclick="QRDecomposition.nextStep()">Next Step</button>
                <button class="btn btn-secondary" onclick="QRDecomposition.reset()">Reset</button>
            </div>

            <div class="legend">
                <div class="legend-item"><div class="legend-color orthogonal"></div><span>Orthogonal Vector</span></div>
                <div class="legend-item"><div class="legend-color updating"></div><span>Currently Updating</span></div>
                <div class="legend-item"><div class="legend-color used"></div><span>Used in Calculation</span></div>
            </div>

            <div class="matrix-row">
                <div class="matrix-container">
                    <h4>Matrix A</h4>
                    <div id="qr-matrix-a"></div>
                </div>
            </div>
            <div class="matrix-row">
                <div class="matrix-container">
                    <h4>Orthogonal Q</h4>
                    <div id="qr-matrix-q"></div>
                </div>
                <div class="matrix-container">
                    <h4>Upper Triangular R</h4>
                    <div id="qr-matrix-r"></div>
                </div>
            </div>

            <div class="description" id="qr-description"></div>
        `;
    }

    static initialize() {
        this.generate();
    }

    static generate() {
        this.state.N = parseInt(document.getElementById('qr-size').value);
        this.state.A = MatrixUtils.generateRandomMatrix(this.state.N, this.state.N);
        this.state.Q = MatrixUtils.createZeroMatrix(this.state.N, this.state.N);
        this.state.R = MatrixUtils.createZeroMatrix(this.state.N, this.state.N);
        this.state.step = 0;
        this.state.currentCol = 0;

        this.performQR();
        this.updateDisplay();
        this.updateDescription(`
            <h3>QR Decomposition: A = Q × R</h3>
            <div class="formula">
                A = Q × R
            </div>
            <div class="info-box">
                <strong>Key Concepts:</strong>
                <ul>
                    <li><strong>Q</strong>: Orthogonal matrix (QᵀQ = I)</li>
                    <li><strong>R</strong>: Upper triangular matrix</li>
                    <li>Uses Gram-Schmidt process or Householder transformations</li>
                    <li>Applications: Least squares, eigenvalues, matrix inversion</li>
                </ul>
            </div>
            <div class="info-box">
                <strong>Orthogonality & Normalization:</strong>
                <ul>
                    <li>Vectors in Q are orthonormal (unit length, perpendicular)</li>
                    <li>Dot product between different columns = 0</li>
                    <li>Norm of each column vector = 1</li>
                </ul>
            </div>
        `);
    }

    static performQR() {
        // Gram-Schmidt 과정 (간소화)
        const A = this.state.A.map(row => [...row]);
        const Q = MatrixUtils.createZeroMatrix(this.state.N, this.state.N);
        const R = MatrixUtils.createZeroMatrix(this.state.N, this.state.N);

        for (let j = 0; j < this.state.N; j++) {
            // j번째 열 벡터
            let v = [];
            for (let i = 0; i < this.state.N; i++) {
                v[i] = A[i][j];
            }

            // 직교화
            for (let k = 0; k < j; k++) {
                let dot = 0;
                for (let i = 0; i < this.state.N; i++) {
                    dot += A[i][j] * Q[i][k];
                }
                R[k][j] = dot;
                
                for (let i = 0; i < this.state.N; i++) {
                    v[i] -= dot * Q[i][k];
                }
            }

            // 정규화
            let norm = 0;
            for (let i = 0; i < this.state.N; i++) {
                norm += v[i] * v[i];
            }
            norm = Math.sqrt(norm);
            R[j][j] = norm;

            for (let i = 0; i < this.state.N; i++) {
                Q[i][j] = v[i] / norm;
            }
        }

        this.state.Q = Q;
        this.state.R = R;
    }

    static nextStep() {
        // 단계별 시뮬레이션
        if (this.state.currentCol < this.state.N) {
            const highlight = [];
            for (let i = 0; i < this.state.N; i++) {
                highlight.push([i, this.state.currentCol]);
            }

            this.updateDisplay(highlight);
            
            this.updateDescription(`
                <h3>Step ${this.state.step + 1}: Processing Column ${this.state.currentCol + 1}</h3>
                <div class="formula">
                    Orthogonalizing and normalizing column vector ${this.state.currentCol + 1}
                </div>
                <div class="info-box">
                    <strong>Gram-Schmidt Process:</strong>
                    <ol>
                        <li>Subtract projections onto previous orthogonal vectors</li>
                        <li>Normalize the resulting vector to unit length</li>
                        <li>Store in Q matrix</li>
                    </ol>
                </div>
            `);

            this.state.currentCol++;
            this.state.step++;
        } else {
            this.updateDescription(`
                <h3>QR Decomposition Complete!</h3>
                <div class="formula">
                    A = Q × R
                </div>
                <div class="info-box">
                    <strong>Verification:</strong>
                    <ul>
                        <li>Q is orthogonal: Qᵀ × Q = I</li>
                        <li>R is upper triangular</li>
                        <li>Q × R = original matrix A</li>
                    </ul>
                </div>
            `);
        }
    }

    static reset() {
        this.generate();
    }

    static updateDisplay(highlight = []) {
        document.getElementById('qr-matrix-a').innerHTML = 
            MatrixUtils.createTable(this.state.A);
        document.getElementById('qr-matrix-q').innerHTML = 
            MatrixUtils.createTable(this.state.Q, { highlight, specialType: 'orthogonal' });
        document.getElementById('qr-matrix-r').innerHTML = 
            MatrixUtils.createTable(this.state.R, { highlight });
    }

    static updateDescription(html) {
        document.getElementById('qr-description').innerHTML = html;
    }
}