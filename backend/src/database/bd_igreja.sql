CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome_completo VARCHAR(255) NOT NULL,
    data_nascimento DATE NOT NULL,
    telefone VARCHAR(20) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    endereco VARCHAR(255) NOT NULL,
    estado_civil ENUM('Solteiro', 'Casado', 'Divorciado', 'Viúvo') NOT NULL,
    data_entrada DATE NOT NULL,
    batizado ENUM('Sim', 'Não') NOT NULL,
    data_batismo DATE NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    codigo_recuperacao VARCHAR(10) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE relatorios_culto (
    id INT AUTO_INCREMENT PRIMARY KEY,
    dia_semana ENUM('Domingo', 'Quarta', 'Sábado') NOT NULL,
    data_culto DATE NOT NULL,
    visitantes INT(4),
    total_presentes INT,
    oferta_geral DECIMAL(10,2) DEFAULT 0.00,
    oferta_social DECIMAL(10,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE dizimos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    relatorio_id INT NOT NULL,
    usuario_id INT NULL, -- pode ser NULL se usar nome_livre
    nome_livre VARCHAR(255) NULL, -- usado quando não há usuário cadastrado
    valor DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (relatorio_id) REFERENCES relatorios_culto(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);


CREATE TABLE outras_ofertas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    relatorio_id INT NOT NULL,
    descricao VARCHAR(255) NOT NULL, -- ex: "Oferta para Reforma"
    valor DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (relatorio_id) REFERENCES relatorios_culto(id) ON DELETE CASCADE
);