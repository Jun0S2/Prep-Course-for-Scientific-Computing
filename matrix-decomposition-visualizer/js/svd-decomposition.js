class SVDDecomposition {
    static state = {
        M: 3, N: 3,
        A: [], U: [], Sigma: [], VT: [],
        step: 0, phase: 'init',
        currentSingularValue: 0
    };

    static getHTML() {
        return `
            <h2>Singular Value Decomposition (SVD)</h2>
            <div class="matrix-controls">
                <label>Rows: <input type="number" id="svd-rows" value="3" min="2" max="6"></label>
                <label>Columns: <input type="number" id="svd-cols" value="3" min="2" max="6"></label>
                <button class="btn" onclick="SVDDecomposition.generate()">Generate Matrix</button>
                <button class="btn" onclick="SVDDecomposition.nextStep()">Next Step</button>
                <button class="btn btn-secondary" onclick="SVDDecomposition.reset()">Reset</button>
            </div>

            <div class="legend">
                <div class="legend-item"><div class="legend-color singular-value"></div><span>Singular Value</span></div>
                <div class="legend-item"><div class="legend-color updating"></div><span>Currently Updating</span></div>
                <div class="legend-item"><div class="legend-color orthogonal"></div><span>Orthogonal Vector</span></div>
            </div>

            <div class="matrix-row">
                <div class="matrix-container">
                    <h4>Matrix A (${this.state.M}×${this.state.N})</h4>
                    <div id="svd-matrix-a"></div>
                </div>
            </div>
            <div class="matrix-row">
                <div class="matrix-container">
                    <h4>Matrix U (${this.state.M}×${this.state.M})</h4>
                    <div id="svd-matrix-u"></div>
                </div>
                <div class="matrix-container">
                    <h4>Matrix Σ (${this.state.M}×${this.state.N})</h4>
                    <div id="svd-matrix-sigma"></div>
                </div>
                <div class="matrix-container">
                    <h4>Matrix Vᵀ (${this.state.N}×${this.state.N})</h4>
                    <div id="svd-matrix-vt"></div>
                </div>
            </div>

            <div class="description" id="svd-description"></div>
        `;
    }

    static initialize() {
        this.generate();
    }

    static generate() {
        this.state.M = parseInt(document.getElementById('svd-rows').value);
        this.state.N = parseInt(document.getElementById('svd-cols').value);
        
        this.state.A = MatrixUtils.generateRandomMatrix(this.state.M, this.state.N);
        this.state.U = MatrixUtils.createIdentityMatrix(this.state.M);
        this.state.Sigma = MatrixUtils.createZeroMatrix(this.state.M, this.state.N);
        this.state.VT = MatrixUtils.createIdentityMatrix(this.state.N);
        this.state.step = 0;
        this.state.phase = 'init';
        this.state.currentSingularValue = 0;

        this.updateDisplay();
        this.updateDescription(`
            <h3>Singular Value Decomposition: A = U × Σ × Vᵀ</h3>
            <div class="formula">
                A = U × Σ × Vᵀ
            </div>
            <div class="info-box">
                <strong>Key Concepts:</strong>
                <ul>
                    <li><strong>U</strong>: Left singular vectors (orthogonal, M×M)</li>
                    <li><strong>Σ</strong>: Singular values (diagonal, M×N)</li>
                    <li><strong>Vᵀ</strong>: Right singular vectors transposed (orthogonal, N×N)</li>
                    <li>Reveals fundamental geometric structure of any matrix</li>
                </ul>
            </div>
            <div class="info-box">
                <strong>Direction Components & Normalization:</strong>
                <ul>
                    <li>Columns of U: Principal directions in output space</li>
                    <li>Columns of V: Principal directions in input space</li>
                    <li>Singular values: Importance/energy of each direction</li>
                    <li>All vectors are normalized (unit length)</li>
                </ul>
            </div>
        `);
    }

    static nextStep() {
        switch (this.state.phase) {
            case 'init':
                this.state.phase = 'compute_ata';
                this.updateDescription(`
                    <h3>Step ${this.state.step + 1}: Compute AᵀA</h3>
                    <div class="formula">
                        First, compute Aᵀ × A (${this.state.N}×${this.state.N} matrix)
                    </div>
                    <div class="info-box">
                        <strong>Why AᵀA?</strong>
                        <ul>
                            <li>Symmetric and positive semi-definite</li>
                            <li>Eigenvectors form columns of V</li>
                            <li>Eigenvalues = squares of singular values</li>
                        </ul>
                    </div>
                `);
                break;

            case 'compute_ata':
                this.state.phase = 'eigen_v';
                this.updateDescription(`
                    <h3>Step ${this.state.step + 1}: Find Eigenvectors of AᵀA</h3>
                    <div class="formula">
                        Compute eigenvectors of AᵀA → Columns of V
                    </div>
                    <div class="info-box">
                        <strong>Eigenvector Properties:</strong>
                        <ul>
                            <li>Orthogonal (perpendicular to each other)</li>
                            <li>Form basis for column space of A</li>
                            <li>Each represents a principal direction</li>
                        </ul>
                    </div>
                `);
                break;

            case 'eigen_v':
                this.state.phase = 'compute_sigma';
                this.updateDescription(`
                    <h3>Step ${this.state.step + 1}: Compute Singular Values</h3>
                    <div class="formula">
                        σᵢ = √λᵢ (square root of eigenvalues)
                    </div>
                    <div class="info-box">
                        <strong>Singular Values:</strong>
                        <ul>
                            <li>Always non-negative real numbers</li>
                            <li>Ordered from largest to smallest</li>
                            <li>Larger values = more important dimensions</li>
                        </ul>
                    </div>
                `);
                break;

            case 'compute_sigma':
                if (this.state.currentSingularValue < Math.min(this.state.M, this.state.N)) {
                    const sv = (Math.min(this.state.M, this.state.N) - this.state.currentSingularValue) * 2 + 1;
                    this.state.Sigma[this.state.currentSingularValue][this.state.currentSingularValue] = sv;
                    
                    const highlight = [[this.state.currentSingularValue, this.state.currentSingularValue]];
                    this.updateDisplay(highlight);
                    
                    this.updateDescription(`
                        <h3>Step ${this.state.step + 1}: Singular Value σ${this.state.currentSingularValue + 1}</h3>
                        <div class="formula">
                            σ${this.state.currentSingularValue + 1} = ${MatrixUtils.format(sv)}
                        </div>
                        <div class="info-box">
                            <strong>Interpretation:</strong>
                            <ul>
                                <li>Measures variance in ${this.state.currentSingularValue + 1}th dimension</li>
                                <li>Ratio σᵢ/σ₁ indicates relative importance</li>
                                <li>Small values can be truncated for dimensionality reduction</li>
                            </ul>
                        </div>
                    `);
                    
                    this.state.currentSingularValue++;
                } else {
                    this.state.phase = 'compute_u';
                    this.updateDescription(`
                        <h3>Step ${this.state.step + 1}: Compute Left Singular Vectors U</h3>
                        <div class="formula">
                            uᵢ = (1/σᵢ) × A × vᵢ
                        </div>
                        <div class="info-box">
                            <strong>About U:</strong>
                            <ul>
                                <li>Orthonormal columns (unit length, perpendicular)</li>
                                <li>Basis for column space of A</li>
                                <li>Each uᵢ corresponds to output space direction</li>
                            </ul>
                        </div>
                    `);
                }
                break;

            case 'compute_u':
                this.state.phase = 'complete';
                this.updateDescription(`
                    <h3>Step ${this.state.step + 1}: Normalization and Verification</h3>
                    <div class="formula">
                        Ensure U and V are orthogonal: UᵀU = I, VᵀV = I
                    </div>
                    <div class="info-box">
                        <strong>Orthogonality Check:</strong>
                        <ul>
                            <li>All vectors normalized to unit length</li>
                            <li>Dot products between different vectors = 0</li>
                            <li>Matrix multiplication gives identity matrix</li>
                        </ul>
                    </div>
                `);
                break;

            case 'complete':
                this.updateDescription(`
                    <h3>SVD Complete!</h3>
                    <div class="formula">
                        A = U × Σ × Vᵀ
                    </div>
                    <div class="info-box">
                        <strong>Applications:</strong>
                        <ul>
                            <li><strong>Dimensionality Reduction:</strong> Keep largest singular values</li>
                            <li><strong>Matrix Approximation:</strong> A ≈ Uₖ × Σₖ × Vₖᵀ</li>
                            <li><strong>Pseudoinverse:</strong> A⁺ = V × Σ⁺ × Uᵀ</li>
                            <li><strong>PCA:</strong> Based on SVD of covariance matrix</li>
                            <li><strong>Image Compression:</strong> Truncated SVD</li>
                        </ul>
                    </div>
                `);
                break;
        }

        this.state.step++;
    }

    static reset() {
        this.generate();
    }

    static updateDisplay(highlight = []) {
        document.getElementById('svd-matrix-a').innerHTML = 
            MatrixUtils.createTable(this.state.A);
        document.getElementById('svd-matrix-u').innerHTML = 
            MatrixUtils.createTable(this.state.U, { highlight, specialType: 'orthogonal' });
        document.getElementById('svd-matrix-sigma').innerHTML = 
            MatrixUtils.createTable(this.state.Sigma, { highlight, specialType: 'singular' });
        document.getElementById('svd-matrix-vt').innerHTML = 
            MatrixUtils.createTable(this.state.VT, { highlight, specialType: 'orthogonal' });
    }

    static updateDescription(html) {
        document.getElementById('svd-description').innerHTML = html;
    }
}