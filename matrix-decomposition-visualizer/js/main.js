// 공통 유틸리티 함수
class MatrixUtils {
    static format(value) {
        if (value === '' || value === null || value === undefined) return '';
        const num = Number(value);
        if (Math.abs(num) < 1e-12) return '0';
        return Number(num.toFixed(2));
    }

    static createTable(matrix, options = {}) {
        const {
            highlight = [],
            pivot = [],
            used = [],
            swapped = [],
            candidates = [],
            isVector = false,
            specialType = null
        } = options;

        let html = '<table class="matrix-table">';
        
        if (isVector) {
            for (let i = 0; i < matrix.length; i++) {
                html += '<tr>';
                const val = matrix[i];
                let cls = 'empty';
                
                if (highlight.some(p => p[0] === i && p[1] === 0)) cls = 'updating';
                else if (val !== '' && val !== 0) cls = 'filled';
                
                html += `<td class="${cls}">${this.format(val)}</td>`;
                html += '</tr>';
            }
        } else {
            for (let i = 0; i < matrix.length; i++) {
                html += '<tr>';
                for (let j = 0; j < matrix[i].length; j++) {
                    const val = matrix[i][j];
                    let cls = 'empty';
                    
                    // 특수 타입 처리
                    if (specialType === 'singular' && i === j && val !== 0) {
                        cls = 'singular-value';
                    } else if (specialType === 'eigen' && i === j && val !== 0) {
                        cls = 'eigen-value';
                    } else if (specialType === 'orthogonal') {
                        cls = 'orthogonal';
                    }
                    // 상태별 색상 (우선순위 중요)
                    else if (swapped.some(p => p[0] === i && p[1] === j)) cls = 'swapped';
                    else if (pivot.some(p => p[0] === i && p[1] === j)) cls = 'pivot';
                    else if (candidates.some(p => p[0] === i && p[1] === j)) cls = 'pivot-candidate';
                    else if (highlight.some(p => p[0] === i && p[1] === j)) cls = 'updating';
                    else if (used.some(p => p[0] === i && p[1] === j)) cls = 'used';
                    else if (val !== '' && val !== 0) cls = 'filled';
                    else if (val === 1) cls = 'filled';
                    
                    html += `<td class="${cls}">${this.format(val)}</td>`;
                }
                html += '</tr>';
            }
        }
        
        html += '</table>';
        return html;
    }

    static generateRandomMatrix(rows, cols, min = 1, max = 10) {
        const matrix = [];
        for (let i = 0; i < rows; i++) {
            matrix[i] = [];
            for (let j = 0; j < cols; j++) {
                matrix[i][j] = Math.floor(Math.random() * (max - min + 1)) + min;
            }
        }
        return matrix;
    }

    static createIdentityMatrix(size) {
        const matrix = [];
        for (let i = 0; i < size; i++) {
            matrix[i] = [];
            for (let j = 0; j < size; j++) {
                matrix[i][j] = i === j ? 1 : 0;
            }
        }
        return matrix;
    }

    static createZeroMatrix(rows, cols) {
        const matrix = [];
        for (let i = 0; i < rows; i++) {
            matrix[i] = Array(cols).fill(0);
        }
        return matrix;
    }
}

// 메인 애플리케이션
class MatrixDecompositionApp {
    constructor() {
        this.currentDecomposition = null;
    }

    loadDecomposition(type) {
        this.currentDecomposition = type;
        const container = document.getElementById('decomposition-container');
        
        // 동적으로 해당 분해 모듈 로드
        const script = document.createElement('script');
        script.src = `js/${type}-decomposition.js`;
        script.onload = () => {
            this.initializeDecomposition(type);
        };
        document.head.appendChild(script);
    }

    initializeDecomposition(type) {
        const container = document.getElementById('decomposition-container');
        
        switch (type) {
            case 'lu':
                container.innerHTML = LUDecomposition.getHTML();
                LUDecomposition.initialize();
                break;
            case 'ldu':
                container.innerHTML = LDUDecomposition.getHTML();
                LDUDecomposition.initialize();
                break;
            case 'qr':
                container.innerHTML = QRDecomposition.getHTML();
                QRDecomposition.initialize();
                break;
            case 'svd':
                container.innerHTML = SVDDecomposition.getHTML();
                SVDDecomposition.initialize();
                break;
            case 'spectral':
                container.innerHTML = SpectralDecomposition.getHTML();
                SpectralDecomposition.initialize();
                break;
        }
    }
}

// 전역 앱 인스턴스 생성
const app = new MatrixDecompositionApp();

// 글로벌 함수
function loadDecomposition(type) {
    app.loadDecomposition(type);
}