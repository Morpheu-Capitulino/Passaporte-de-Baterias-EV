# Passaporte Digital de Baterias EV 🌱

Este projeto é uma aplicação descentralizada (**dApp**) que implementa um **Passaporte Digital de Baterias para Veículos Elétricos (EV)** utilizando tecnologia **Blockchain**.

O sistema permite garantir a **rastreabilidade imutável**, o registro do **histórico de manutenções** e a **monitorização do Estado de Saúde (SoH — State of Health)** das baterias ao longo de todo o seu ciclo de vida.

---

## Tecnologias Utilizadas

| Tecnologia       | Utilização                                                     |
| ---------------- | -------------------------------------------------------------- |
| **Solidity**     | Desenvolvimento dos Smart Contracts                            |
| **Hardhat**      | Desenvolvimento e execução da Blockchain local                 |
| **React.js**     | Desenvolvimento da interface web                               |
| **Vite**         | Ferramenta de build e servidor de desenvolvimento do Front-end |
| **Ethers.js v6** | Integração entre Front-end e Blockchain                        |
| **MetaMask**     | Carteira Web3 para interação com a aplicação                   |

---

## Arquitetura do Projeto

O projeto está dividido em duas partes principais:

```text
Passaporte Digital de Baterias EV
│
├── Blockchain
│   ├── Smart Contracts (Solidity)
│   ├── Hardhat
│   └── Scripts de Deploy
│
└── Front-end
    ├── React.js
    ├── Vite
    ├── Ethers.js
    └── MetaMask
```

A Blockchain é responsável por armazenar os dados de forma descentralizada e imutável, enquanto o Front-end fornece uma interface para interação com os contratos inteligentes.

---

# Pré-requisitos

Antes de executar o projeto, certifique-se de que possui os seguintes requisitos instalados:

* [Node.js](https://nodejs.org/) — versão **18 ou superior**
* [MetaMask](https://metamask.io/) — extensão instalada no navegador
* **NPM** — normalmente instalado junto com o Node.js

Para verificar a versão do Node.js:

```bash
node --version
```

Para verificar a versão do NPM:

```bash
npm --version
```

---

# Como Executar o Projeto Localmente

A aplicação utiliza uma **Blockchain local através do Hardhat**, portanto serão necessários **dois terminais abertos simultaneamente**.

## 1. Iniciar a Blockchain Local

No primeiro terminal, na **raiz do projeto**, execute:

```bash
npm install
```

Depois, inicialize a rede local:

```bash
npx hardhat node
```

O Hardhat irá iniciar uma Blockchain local e disponibilizar várias contas de teste.

O terminal apresentará informações semelhantes a:

```text
Started HTTP and WebSocket JSON-RPC server at http://127.0.0.1:8545/
```

Além disso, serão exibidas várias contas de teste e suas respectivas **Private Keys**.

> **Importante:** mantenha este terminal aberto durante toda a execução da aplicação.

---

# Deploy do Smart Contract

Abra um **segundo terminal**, também na raiz do projeto.

Primeiro, compile os contratos:

```bash
npx hardhat compile
```

Depois, execute o script de deploy:

```bash
npx hardhat run scripts/deploy.ts --network localhost
```

Ao finalizar, o terminal exibirá o endereço do contrato implantado, por exemplo:

```text
Contract deployed to: 0x1234567890abcdef1234567890abcdef12345678
```

> Copie esse endereço. Ele será utilizado na configuração do Front-end.

---

# 💻 Configuração do Front-end

Ainda no segundo terminal, entre na pasta do Front-end:

```bash
cd frontend
```

Instale as dependências:

```bash
npm install
```

Agora abra o arquivo:

```text
frontend/src/App.jsx
```

Localize a variável:

```javascript
const CONTRACT_ADDRESS = "SEU_ENDERECO_AQUI";
```

Substitua pelo endereço gerado durante o deploy:

```javascript
const CONTRACT_ADDRESS = "0x1234567890abcdef1234567890abcdef12345678";
```

Depois, execute o servidor de desenvolvimento:

```bash
npm run dev
```

O Vite exibirá um endereço semelhante a:

```text
http://localhost:5173
```

Abra esse endereço no navegador.

---

# Configuração do MetaMask

Para interagir com os Smart Contracts, o MetaMask precisa estar conectado à Blockchain local do Hardhat.

## 1. Adicionar a rede local

Abra o MetaMask e acesse:

**Configurações → Redes → Adicionar rede**

Adicione manualmente os seguintes dados:

| Campo                | Valor                   |
| -------------------- | ----------------------- |
| **Nome da rede**     | Hardhat Local           |
| **URL da RPC**       | `http://127.0.0.1:8545` |
| **Chain ID**         | `31337`                 |
| **Símbolo da moeda** | `ETH`                   |

Salve a configuração e altere sua carteira para a rede:

```text
Hardhat Local
```

---

## 2. Importar a conta de teste

No terminal onde o comando abaixo foi executado:

```bash
npx hardhat node
```

serão exibidas várias contas de teste.

Copie a **Private Key da Account #0**.

No MetaMask:

**Importar conta → Colar Private Key**

Essa conta será utilizada como o **Administrador (Admin)** do sistema.

> **Atenção:** as contas geradas pelo Hardhat são destinadas exclusivamente para desenvolvimento local. Nunca utilize essas Private Keys em redes reais ou ambientes de produção.

---

# Casos de Teste

A aplicação possui diferentes níveis de acesso e regras de negócio que podem ser testados diretamente pela interface.

## 1. Registo e Ativação da Bateria

Acesse o **Painel Admin**.

### Registar uma bateria

Preencha os campos:

```text
ID: BAT-001
Fabricante: Exemplo Motors
Carteira do proprietário: [endereço MetaMask]
```

Clique em:

```text
Registar
```

Após o registro, a bateria será armazenada na Blockchain.

### Ativar a bateria

Clique no botão:

```text
Marcar Bateria como "Em Uso"
```

O estado oficial da bateria deverá mudar de:

```text
Fabricada
```

para:

```text
Em Uso
```

---

# 2. Matriz de Permissões

O sistema possui diferentes papéis responsáveis pela operação do ciclo de vida da bateria.

Para simular os diferentes papéis utilizando a mesma carteira:

1. Copie o endereço da sua carteira MetaMask.
2. Acesse a área **Autorizar Acessos**.
3. Cole o endereço.
4. Clique em:

```text
Autorizar BMS
```

5. Depois clique em:

```text
Autorizar Oficina
```

A carteira utilizada passará a possuir as permissões necessárias para testar os diferentes painéis.

---

# 3. Ciclo de Vida e Telemetria

## Segunda Vida

Acesse o **Painel BMS**.

Informe:

```text
ID: BAT-001
SoH: 65
```

Clique em:

```text
Atualizar
```

### Regra de negócio

Quando o **SoH for inferior a 70%**, a bateria deverá entrar automaticamente no estado:

```text
Segunda Vida
```

Assim, uma bateria com:

```text
SoH = 65%
```

deverá apresentar:

```text
Estado: Segunda Vida
```

Essa alteração fica registrada na Blockchain.

---

## Falha Crítica

Ainda no painel BMS, registre uma falha utilizando, por exemplo:

```text
ID: BAT-001
Código: ERR-TEMP
Gravidade: Alta
```

Ao registrar a falha, o estado da bateria deverá ser atualizado automaticamente para:

```text
Risco Crítico
```

Isso permite representar situações em que a bateria apresenta uma condição que exige atenção imediata.

---

# 4. Histórico Imutável de Manutenção

Acesse o **Painel Oficina**.

Preencha:

```text
ID: BAT-001
Descrição: Troca de Célula de Refrigeração
```

Clique em:

```text
Registar Manutenção
```

O registro será gravado na Blockchain.

Por utilizar tecnologia Blockchain, o histórico registrado no contrato pode ser utilizado como um histórico rastreável e imutável das intervenções realizadas na bateria.

---

# 5. Consulta Pública — Gêmeo Digital

Na parte inferior da aplicação está disponível a seção:

```text
Público: Consultar Bateria
```

Digite:

```text
BAT-001
```

O sistema realizará uma consulta diretamente na Blockchain e apresentará as principais informações relacionadas à bateria.

Entre os dados apresentados estão:

* Estado atual da bateria
* Estado de Saúde (SoH)
* Proprietário
* Fabricante
* Histórico de manutenção
* Registros de falhas
* Linha do tempo do ciclo de vida

Dessa forma, a aplicação funciona como um **Gêmeo Digital da bateria**, permitindo consultar seu histórico e estado atual através dos dados armazenados no Smart Contract.

---

# Fluxo Completo de Teste

Para validar o funcionamento completo da aplicação, recomenda-se seguir o fluxo abaixo:

```text
1. Iniciar Blockchain
        ↓
2. Deploy do Smart Contract
        ↓
3. Configurar CONTRACT_ADDRESS
        ↓
4. Iniciar Front-end
        ↓
5. Conectar MetaMask
        ↓
6. Registrar bateria
        ↓
7. Ativar bateria
        ↓
8. Autorizar BMS
        ↓
9. Autorizar Oficina
        ↓
10. Atualizar SoH
        ↓
11. Registrar falha
        ↓
12. Registrar manutenção
        ↓
13. Consultar bateria publicamente
```

---

# Regras de Negócio Principais

### Estado inicial

Ao ser registrada:

```text
Fabricada
```

### Bateria em operação

Após ativação:

```text
Em Uso
```

### Segunda Vida

Quando:

```text
SoH < 70%
```

o estado passa para:

```text
Segunda Vida
```

### Risco Crítico

Quando é registrada uma falha com gravidade alta:

```text
Gravidade = Alta
```

o estado passa para:

```text
Risco Crítico
```

---

# Estrutura Sugerida do Projeto

A estrutura do projeto pode ser organizada da seguinte maneira:

```text
.
├── contracts/
│   └── BatteryPassport.sol
│
├── scripts/
│   └── deploy.ts
│
├── test/
│   └── ...
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   └── ...
│   ├── package.json
│   └── vite.config.js
│
├── hardhat.config.ts
├── package.json
└── README.md
```

---

# Principais Funcionalidades

O sistema permite:

* ✅ Registro de baterias
* ✅ Ativação e alteração do estado da bateria
* ✅ Rastreamento do ciclo de vida
* ✅ Monitorização do SoH
* ✅ Identificação automática de baterias em segunda vida
* ✅ Registro de falhas
* ✅ Identificação de risco crítico
* ✅ Controle de permissões baseado em carteiras
* ✅ Registro de manutenções
* ✅ Histórico imutável
* ✅ Consulta pública do passaporte digital
* ✅ Integração com MetaMask
* ✅ Interação direta com Smart Contracts

---

# Objetivo do Projeto

O objetivo do **Passaporte Digital de Baterias EV** é demonstrar como a tecnologia Blockchain pode ser aplicada à **rastreabilidade e gestão do ciclo de vida de baterias utilizadas em veículos elétricos**.

A proposta permite centralizar informações importantes sobre cada bateria de forma verificável, criando uma camada de confiança entre fabricantes, operadores, oficinas, proprietários e demais participantes do ecossistema.

A aplicação também demonstra conceitos fundamentais de desenvolvimento Web3, como:

```text
Smart Contracts
      +
Blockchain
      +
Web3 Wallet
      +
React
      +
Ethers.js
```

formando uma aplicação descentralizada capaz de consultar e registrar informações diretamente na Blockchain.

---

#  Observações

Este projeto utiliza uma **Blockchain local do Hardhat** e foi desenvolvido para fins de **desenvolvimento, demonstração e testes**.

Os dados, contas e chaves privadas utilizadas durante a execução local não devem ser utilizados em ambientes de produção.

Para utilizar a solução em uma Blockchain pública, será necessário adaptar a configuração da rede, deploy dos contratos, gerenciamento de carteiras e demais componentes de segurança.

---

# 👨‍💻 Desenvolvimento

Projeto desenvolvido como demonstração de aplicação de **Blockchain, Web3 e Smart Contracts** para rastreabilidade de baterias de veículos elétricos.

**Tecnologias principais:**

```text
Solidity
Hardhat
React
Vite
Ethers.js
MetaMask
```

---

⭐ **Projeto experimental para demonstração de Blockchain aplicada ao ciclo de vida de baterias de veículos elétricos.**
