# app.py
from flask import Flask, render_template, request, jsonify
import numpy as np
import json

app = Flask(__name__)

def vogel_approximation(costs, supply, demand):
    """
    Implementa el método de aproximación de Vogel para el problema de transporte
    """
    costs = np.array(costs)
    m, n = costs.shape
    allocation = np.zeros((m, n))
    supply_left = supply.copy()
    demand_left = demand.copy()
    
    while np.sum(supply_left) > 0 and np.sum(demand_left) > 0:
        # Calcular penalizaciones por fila
        row_penalties = []
        for i in range(m):
            if supply_left[i] > 0:
                available_cols = [j for j in range(n) if demand_left[j] > 0]
                if len(available_cols) >= 2:
                    sorted_costs = sorted([costs[i][j] for j in available_cols])
                    row_penalties.append(sorted_costs[1] - sorted_costs[0])
                elif len(available_cols) == 1:
                    row_penalties.append(0)
                else:
                    row_penalties.append(-1)
            else:
                row_penalties.append(-1)
        
        # Calcular penalizaciones por columna
        col_penalties = []
        for j in range(n):
            if demand_left[j] > 0:
                available_rows = [i for i in range(m) if supply_left[i] > 0]
                if len(available_rows) >= 2:
                    sorted_costs = sorted([costs[i][j] for i in available_rows])
                    col_penalties.append(sorted_costs[1] - sorted_costs[0])
                elif len(available_rows) == 1:
                    col_penalties.append(0)
                else:
                    col_penalties.append(-1)
            else:
                col_penalties.append(-1)
        
        # Encontrar la penalización máxima
        max_row_penalty = max(row_penalties)
        max_col_penalty = max(col_penalties)
        
        if max_row_penalty >= max_col_penalty and max_row_penalty >= 0:
            i = row_penalties.index(max_row_penalty)
            available_cols = [j for j in range(n) if demand_left[j] > 0]
            j = min(available_cols, key=lambda x: costs[i][x])
        elif max_col_penalty >= 0:
            j = col_penalties.index(max_col_penalty)
            available_rows = [i for i in range(m) if supply_left[i] > 0]
            i = min(available_rows, key=lambda x: costs[x][j])
        else:
            break
            
        # Asignar el valor mínimo entre oferta y demanda
        value = min(supply_left[i], demand_left[j])
        allocation[i][j] = value
        supply_left[i] -= value
        demand_left[j] -= value
    
    return allocation

def minimum_cost_method(costs, supply, demand):
    """
    Implementa el método de costo mínimo para el problema de transporte
    """
    costs = np.array(costs)
    m, n = costs.shape
    allocation = np.zeros((m, n))
    supply_left = supply.copy()
    demand_left = demand.copy()
    
    while np.sum(supply_left) > 0 and np.sum(demand_left) > 0:
        # Encontrar la celda con el costo mínimo donde hay oferta y demanda disponible
        min_cost = float('inf')
        min_i, min_j = -1, -1
        
        for i in range(m):
            if supply_left[i] <= 0:
                continue
            for j in range(n):
                if demand_left[j] <= 0:
                    continue
                if costs[i][j] < min_cost:
                    min_cost = costs[i][j]
                    min_i, min_j = i, j
        
        if min_i == -1 or min_j == -1:
            break
            
        # Asignar el valor mínimo entre oferta y demanda
        value = min(supply_left[min_i], demand_left[min_j])
        allocation[min_i][min_j] = value
        supply_left[min_i] -= value
        demand_left[min_j] -= value
    
    return allocation

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/solve', methods=['POST'])
def solve():
    data = request.get_json()
    
    costs = np.array(data['costs'])
    supply = np.array(data['supply'])
    demand = np.array(data['demand'])
    
    # Verificar si el problema está balanceado
    if sum(supply) != sum(demand):
        return jsonify({
            'error': 'El problema no está balanceado. La suma de la oferta debe ser igual a la suma de la demanda.'
        }), 400
    
    # Resolver usando ambos métodos
    vogel_solution = vogel_approximation(costs, supply, demand)
    min_cost_solution = minimum_cost_method(costs, supply, demand)
    
    # Calcular costos totales
    vogel_total_cost = np.sum(vogel_solution * costs)
    min_cost_total_cost = np.sum(min_cost_solution * costs)
    
    return jsonify({
        'vogel_solution': vogel_solution.tolist(),
        'vogel_total_cost': float(vogel_total_cost),
        'min_cost_solution': min_cost_solution.tolist(),
        'min_cost_total_cost': float(min_cost_total_cost)
    })

if __name__ == '__main__':
    app.run(debug=True)
