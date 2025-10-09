from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import numpy as np
from scipy.linalg import svd, lu, qr, eig
import json

app = Flask(__name__)
CORS(app)  # CORS 허용

@app.route('/')
def serve_frontend():
    return send_from_directory('../', 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory('../', path)

@app.route('/api/svd', methods=['POST'])
def compute_svd():
    try:
        data = request.json
        matrix = np.array(data['matrix'])
        
        # 실제 Scipy SVD 계산
        U, s, Vt = svd(matrix, full_matrices=True)
        
        # 결과를 JSON으로 변환
        result = {
            'U': U.tolist(),
            's': s.tolist(),
            'Vt': Vt.tolist(),
            'success': True
        }
        
        return jsonify(result)
    
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

@app.route('/api/svd/steps', methods=['POST'])
def compute_svd_steps():
    """단계별 SVD 계산 - 수정된 버전"""
    data = request.json
    matrix = np.array(data['matrix'])
    
    steps = []
    
    # 1. 원본 행렬
    steps.append({
        'step': 1,
        'title': 'Original Matrix A',
        'description': 'Starting matrix for SVD decomposition',
        'A': matrix.tolist()
    })
    
    # 2. A^T A 계산
    ATA = matrix.T @ matrix
    steps.append({
        'step': 2,
        'title': 'Compute AᵀA',
        'description': 'Compute transpose(A) × A for eigenvalue analysis',
        'ATA': ATA.tolist()
    })
    
    # 3. 고유값 분해
    eigenvalues, eigenvectors = eig(ATA)
    # 실수부만 취하고 정렬 (내림차순)
    idx = eigenvalues.argsort()[::-1]
    eigenvalues = eigenvalues[idx].real
    eigenvectors = eigenvectors[:, idx].real
    
    steps.append({
        'step': 3,
        'title': 'Eigen Decomposition of AᵀA',
        'description': 'Find eigenvalues and eigenvectors of AᵀA',
        'eigenvalues': eigenvalues.tolist(),
        'eigenvectors': eigenvectors.tolist()
    })
    
    # 4. 특이값 계산
    singular_values = np.sqrt(np.abs(eigenvalues))  # abs 추가 (수치적 안정성)
    steps.append({
        'step': 4,
        'title': 'Compute Singular Values',
        'description': 'σᵢ = √λᵢ (square root of eigenvalues)',
        'singular_values': singular_values.tolist()
    })
    
    # 5. V 행렬 (고유벡터)
    V = eigenvectors
    steps.append({
        'step': 5,
        'title': 'V Matrix (Right Singular Vectors)',
        'description': 'Eigenvectors of AᵀA form columns of V',
        'V': V.tolist()
    })
    
    # 6. U 행렬 계산 - 수정된 부분!
    # 올바른 방법: u_i = (1/σ_i) * A * v_i (각 열별 계산)
    U = np.zeros((matrix.shape[0], matrix.shape[0]))
    for i in range(len(singular_values)):
        if singular_values[i] > 1e-10:  # 0으로 나누기 방지
            u_col = matrix @ V[:, i] / singular_values[i]
            U[:, i] = u_col
        else:
            U[:, i] = 0
    
    # 남은 열들은 Gram-Schmidt로 정규직교화
    from scipy.linalg import orth
    U = orth(U)
    
    steps.append({
        'step': 6,
        'title': 'U Matrix (Left Singular Vectors)',
        'description': 'Compute U using uᵢ = (1/σᵢ) × A × vᵢ',
        'U': U.tolist()
    })
    
    # 7. 최종 SVD (Scipy로 검증)
    U_final, s_final, Vt_final = svd(matrix, full_matrices=True)
    
    # Σ 행렬 생성
    Sigma = np.zeros((matrix.shape[0], matrix.shape[1]))
    for i in range(len(s_final)):
        Sigma[i, i] = s_final[i]
    
    steps.append({
        'step': 7,
        'title': 'Final SVD Result',
        'description': 'Complete SVD: A = U × Σ × Vᵀ',
        'U': U_final.tolist(),
        'Sigma': Sigma.tolist(),  # 대각행렬 형태로
        'Vt': Vt_final.tolist(),
        'singular_values': s_final.tolist(),
        'reconstructed': (U_final @ Sigma @ Vt_final).tolist(),
        'original_matrix': matrix.tolist()
    })
    
    return jsonify({'steps': steps, 'success': True})

@app.route('/api/svd/direct', methods=['POST'])
def compute_svd_direct():
    """직접 SVD 계산 - 간단한 버전"""
    try:
        data = request.json
        matrix = np.array(data['matrix'])
        
        # Scipy SVD 사용
        U, s, Vt = svd(matrix, full_matrices=True)
        
        # Σ 행렬 생성
        Sigma = np.zeros((matrix.shape[0], matrix.shape[1]))
        for i in range(len(s)):
            Sigma[i, i] = s[i]
        
        # 재구성 검증
        reconstructed = U @ Sigma @ Vt
        
        result = {
            'U': U.tolist(),
            'Sigma': Sigma.tolist(),
            'Vt': Vt.tolist(),
            'singular_values': s.tolist(),
            'reconstructed': reconstructed.tolist(),
            'original': matrix.tolist(),
            'success': True
        }
        
        return jsonify(result)
    
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

@app.route('/api/lu', methods=['POST'])
def compute_lu():
    data = request.json
    matrix = np.array(data['matrix'])
    
    try:
        P, L, U = lu(matrix)
        return jsonify({
            'P': P.tolist(),
            'L': L.tolist(), 
            'U': U.tolist(),
            'success': True
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

@app.route('/api/qr', methods=['POST'])
def compute_qr():
    data = request.json
    matrix = np.array(data['matrix'])
    
    try:
        Q, R = qr(matrix)
        return jsonify({
            'Q': Q.tolist(),
            'R': R.tolist(),
            'success': True
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

if __name__ == '__main__':
    app.run(debug=True, port=5000)