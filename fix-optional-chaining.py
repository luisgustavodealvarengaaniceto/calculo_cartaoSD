#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script para remover optional chaining (?.) do app.js
para compatibilidade com navegadores mais antigos
"""

import re

def fix_optional_chaining(content):
    """Remove optional chaining e substitui por verificações tradicionais"""
    
    # Padrão 1: variavel?.propriedade
    # Substituir por: variavel && variavel.propriedade
    pattern1 = r'(\w+)\?\.(\w+)'
    content = re.sub(pattern1, r'\1 && \1.\2', content)
    
    # Padrão 2: variavel?.[index]
    # Substituir por: variavel && variavel[index]
    pattern2 = r'(\w+)\?\.\[([^\]]+)\]'
    content = re.sub(pattern2, r'\1 && \1[\2]', content)
    
    return content

def main():
    input_file = 'app.js'
    output_file = 'app.js'
    
    print("🔧 Removendo optional chaining de app.js...")
    
    # Ler arquivo
    with open(input_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Contar ocorrências antes
    count_before = content.count('?.')
    print(f"   Encontradas {count_before} ocorrências de '?.'")
    
    # Aplicar correções
    fixed_content = fix_optional_chaining(content)
    
    # Contar ocorrências depois
    count_after = fixed_content.count('?.')
    print(f"   Restam {count_after} ocorrências de '?.'")
    
    # Salvar arquivo corrigido
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(fixed_content)
    
    print(f"✅ Arquivo {output_file} corrigido!")
    print(f"   {count_before - count_after} ocorrências removidas")
    
    if count_after > 0:
        print(f"   ⚠️  Ainda restam {count_after} ocorrências que precisam ser corrigidas manualmente")

if __name__ == '__main__':
    main()
