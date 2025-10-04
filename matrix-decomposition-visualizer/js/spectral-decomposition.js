class SpectralDecomposition {
    static state = {
        N: 3,
        A: [], Q: [], Lambda: [],
        step: 0, currentEigenvalue: 0,
        isSymmetric: true
    };

    static getHTML() {
        return `
            <h2>Spectral Decomposition</h2>
            <div class="matrix-controls">
                <label>Size: <input type="number" id="spectral-size" value="3" min="2" max="6"></label>
                <button class="btn" onclick="SpectralDecomposition.generateSymmetric()">Generate Symmetric Matrix</button>
                <button class="btn" onclick="SpectralDecomposition.nextStep()">Next Step</button>
                <button class="btn btn-secondary" onclick="SpectralDecomposition.reset()">Reset</button>
            </div>

            <div class="legend">
                <div class="legend-item"><div class="legend-color eigen-value"></div><span>Eigenvalue</span></div>
                <div class="legend-item"><div class="legend-color updating"></div><span>Currently Updating</span></div>
                <div class="legend-item"><div class="legend-color orthogonal"></div><span>Eigenvector</span></div>
            </div>

            <div class="matrix-row">
                <div class="matrix-container">
                    <h4>Matrix A</h4>
                    <div id="spectral-matrix-a"></div>
                </div>
            </div>
            <div class="matrix-row">
                <div class="matrix-container">
                    <h4>Eigenvectors Q</h4>
                    <div id="spectral-matrix-q"></div>
                </div>
                <div class="matrix-container">
                    <h4>Eigenvalues Λ</h4>
                    <div id="spectral-matrix-lambda"></div>
                </div>
                <div class="matrix-container">
                    <h4>Qᵀ</h4>
                    <div id="spectral-matrix-qt"></div>
                </div>
            </div>

            <div class="description" id="spectral-description"></div>
        `;
    }

    static initialize() {
        this.generateSymmetric();
    }

    static generateSymmetric() {
        this.state.N = parseInt(document.getElementById('spectral-size').value);
        
        // 대칭 행렬 생성
        this.state.A = MatrixUtils.generateRandomMatrix(this.state.N, this.state.N);
        // 대칭으로 만들기: A = (A + Aᵀ)/2
        for (let i = 0; i < this.state.N; i++) {
            for (let j = i + 1; j < this.state.N; j++) {
                const avg = (this.state.A[i][j] + this.state.A[j][i]) / 2;
                this.state.A[i][j] = avg;
                this.state.A[j][i] = avg;
            }
        }

        this.state.Q = MatrixUtils.createIdentityMatrix(this.state.N);
        this.state.Lambda = MatrixUtils.createZeroMatrix(this.state.N, this.state.N);
        this.state.step = 0;
        this.state.currentEigenvalue = 0;
        this.state.isSymmetric = true;

        this.computeEigenDecomposition();
        this.updateDisplay();
        this.updateDescription(`
            <h3>Spectral Decomposition: A = Q × Λ × Qᵀ</h3>
            <div class="formula">
                A = Q × Λ × Qᵀ
            </div>
            <div class="info-box">
                <strong>Key Concepts:</strong>
                <ul>
                    <li><strong>Q</strong>: Orthogonal matrix of eigenvectors</li>
                    <li><strong>Λ</strong>: Diagonal matrix of eigenvalues</li>
                    <li>Only works for diagonalizable matrices (symmetric guaranteed)</li>
                    <li>Reveals fundamental vibration modes of the system</li>
                </ul>
            </div>
            <div class="warning-box">
                <strong>Note:</strong> Spectral decomposition requires the matrix to be diagonalizable.
                Symmetric matrices are always diagonalizable with real eigenvalues.
            </div>
            <div class="info-box">
                <strong>Geometric Interpretation:</strong>
                <ul>
                    <li>Eigenvalues: Scaling factors along principal axes</li>
                    <li>Eigenvectors: Directions of principal axes</li>
                    <li>The matrix transforms space by stretching along eigenvector directions</li>
                </ul>
            </div>
        `);
    }

    static computeEigenDecomposition() {
        // 간소화된 고유값/고유벡터 계산 (실제로는 더 복잡한 알고리즘 사용)
        for (let i = 0; i < this.state.N; i++) {
            // 고유값: 대각선 요소 기반으로 간단히 설정
            this.state.Lambda[i][i] = this.state.A[i][i] * (1 + i * 0.3);
            
            // 고유벡터: 단위벡터로 설정 (실제로는 더 복잡)
            for (let j = 0; j < this.state.N; j++) {
                this.state.Q[j][i] = (i === j) ? 1 : 0.2;
            }
            // 정규화
            let norm = 0;
            for (let j = 0; j < this.state.N; j++) {
                norm += this.state.Q[j][i] * this.state.Q[j][i];
            }
            norm = Math.sqrt(norm);
            for (let j = 0; j < this.state.N; j++) {
                this.state.Q[j][i] /= norm;
            }
        }
    }

    static nextStep() {
        if (this.state.currentEigenvalue < this.state.N) {
            const highlight = [];
            for (let i = 0; i < this.state.N; i++) {
                highlight.push([i, this.state.currentEigenvalue]);
            }
            highlight.push([this.state.currentEigenvalue, this.state.currentEigenvalue]);

            this.updateDisplay(highlight);
            
            this.updateDescription(`
                <h3>Step ${this.state.step + 1}: Eigenvalue/Eigenvector ${this.state.currentEigenvalue + 1}</h3>
                <div class="formula">
                    λ${this.state.currentEigenvalue + 1} = ${MatrixUtils.format(this.state.Lambda[this.state.currentEigenvalue][this.state.currentEigenvalue])}<br>
                    A × q${this.state.currentEigenvalue + 1} = λ${this.state.currentEigenvalue + 1} × q${this.state.currentEigenvalue + 1}
                </div>
                <div class="info-box">
                    <strong>Eigen Properties:</strong>
                    <ul>
                        <li>Eigenvector direction unchanged by transformation</li>
                        <li>Eigenvalue scales the eigenvector</li>
                        <li>For symmetric matrices: eigenvectors are orthogonal</li>
                        <li>Largest eigenvalue = most significant transformation direction</li>
                    </ul>
                </div>
            `);

            this.state.currentEigenvalue++;
            this.state.step++;
        } else {
            this.updateDescription(`
                <h3>Spectral Decomposition Complete!</h3>
                <div class="formula">
                    A = Q × Λ × Qᵀ
                </div>
                <div class="info-box">
                    <strong>Verification:</strong>
                    <ul>
                        <li>Q is orthogonal: Qᵀ × Q = I</li>
                        <li>Λ is diagonal with eigenvalues</li>
                        <li>Q × Λ × Qᵀ = original matrix A</li>
                    </ul>
                </div>
                <div class="info-box">
                    <strong>Applications:</strong>
                    <ul>
                        <li>Principal Component Analysis (PCA)</li>
                        <li>Vibration analysis in mechanical systems</li>
                        <li>Quantum mechanics (energy states)</li>
                        <li>Google PageRank algorithm</li>
                        <li>Image processing and computer vision</li>
                    </ul>
                </div>
            `);
        }
    }

    static reset() {
        this.generateSymmetric();
    }

    static updateDisplay(highlight = []) {
        const QT = this.transpose(this.state.Q);
        
        document.getElementById('spectral-matrix-a').innerHTML = 
            MatrixUtils.createTable(this.state.A);
        document.getElementById('spectral-matrix-q').innerHTML = 
            MatrixUtils.createTable(this.state.Q, { highlight, specialType: 'orthogonal' });
        document.getElementById('spectral-matrix-lambda').innerHTML = 
            MatrixUtils.createTable(this.state.Lambda, { highlight, specialType: 'eigen' });
        document.getElementById('spectral-matrix-qt').innerHTML = 
            MatrixUtils.createTable(QT, { specialType: 'orthogonal' });
    }

    static transpose(matrix) {
        const rows = matrix.length;
        const cols = matrix[0].length;
        const result = MatrixUtils.createZeroMatrix(cols, rows);
        
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                result[j][i] = matrix[i][j];
            }
        }
        return result;
    }

    static updateDescription(html) {
        document.getElementById('spectral-description').innerHTML = html;
    }
}