// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract EVBatteryPassport {
    

    enum Status { Fabricada, EmUso, SegundaVida, Reciclada, RiscoCritico }
    
    struct Battery {
        string uniqueId;
        string manufacturer;
        uint256 manufactureDate;
        uint8 stateOfHealth; 
        address owner;
        Status status;
        bool isRegistered;
    }

    struct MaintenanceRecord {
        uint256 date;
        string description;
        address technician; 
    }

    struct FailureRecord {
        uint256 date;
        string errorCode;
        string severity; 
    }
    
    // Mapeamentos principais
    mapping(string => Battery) private batteries;
    mapping(string => MaintenanceRecord[]) private maintenanceHistories;
    mapping(string => FailureRecord[]) private failureHistories;
    
    // Controle de Acesso
    address public adminConsortium;
    mapping(address => bool) public authorizedOracles;   
    mapping(address => bool) public authorizedWorkshops; 
    
    // Eventos
    event BatteryRegistered(string uniqueId, string manufacturer);
    event HealthUpdated(string uniqueId, uint8 newSoH);
    event MaintenanceLogged(string uniqueId, string description);
    event FailureReported(string uniqueId, string errorCode);
    event StatusChanged(string uniqueId, Status newStatus);

    constructor() {
        adminConsortium = msg.sender;
    }

    modifier onlyAdmin() {
        require(msg.sender == adminConsortium, "Acesso negado: Apenas o consorcio");
        _;
    }

    modifier onlyOracle() {
        require(authorizedOracles[msg.sender], "Acesso negado: Apenas sensores IoT autorizados");
        _;
    }

    modifier onlyWorkshop() {
        require(authorizedWorkshops[msg.sender], "Acesso negado: Apenas oficinas credenciadas");
        _;
    }

    // --- Configuração da Rede ---
    function authorizeOracle(address _oracle) public onlyAdmin {
        authorizedOracles[_oracle] = true;
    }
    
    function authorizeWorkshop(address _workshop) public onlyAdmin {
        authorizedWorkshops[_workshop] = true;
    }

    // --- Lógica de Negócios ---

    // Registrar nova bateria no sistema
    function registerBattery(string memory _id, string memory _manufacturer, address _initialOwner) public onlyAdmin {
        require(!batteries[_id].isRegistered, "Bateria ja existe");
        
        batteries[_id] = Battery({
            uniqueId: _id,
            manufacturer: _manufacturer,
            manufactureDate: block.timestamp,
            stateOfHealth: 100,
            owner: _initialOwner,
            status: Status.Fabricada,
            isRegistered: true
        });
        
        emit BatteryRegistered(_id, _manufacturer);
    }

    // Atualizar a porcentagem de saúde 
    function updateHealth(string memory _id, uint8 _newSoH) public onlyOracle {
        require(batteries[_id].isRegistered, "Bateria nao encontrada");
        require(_newSoH <= 100, "SoH deve ser entre 0 e 100");
        
        batteries[_id].stateOfHealth = _newSoH;
        
        if(_newSoH <= 70 && batteries[_id].status == Status.EmUso) {
            batteries[_id].status = Status.SegundaVida;
            emit StatusChanged(_id, Status.SegundaVida);
        }
        
        emit HealthUpdated(_id, _newSoH);
    }

    // Ativar a bateria
    function setInUse(string memory _id) public onlyAdmin {
        require(batteries[_id].isRegistered, "Bateria nao encontrada");
        require(batteries[_id].status == Status.Fabricada, "A bateria ja nao esta na fabrica");
        
        batteries[_id].status = Status.EmUso;
        emit StatusChanged(_id, Status.EmUso);
    }

    // Registrar uma manutenção oficial 
    function logMaintenance(string memory _id, string memory _description) public onlyWorkshop {
        require(batteries[_id].isRegistered, "Bateria nao encontrada");
        
        maintenanceHistories[_id].push(MaintenanceRecord({
            date: block.timestamp,
            description: _description,
            technician: msg.sender
        }));
        
        emit MaintenanceLogged(_id, _description);
    }

    // Reportar uma falha crítica 
    function reportFailure(string memory _id, string memory _errorCode, string memory _severity) public onlyOracle {
        require(batteries[_id].isRegistered, "Bateria nao encontrada");
        
        failureHistories[_id].push(FailureRecord({
            date: block.timestamp,
            errorCode: _errorCode,
            severity: _severity
        }));

        // Se for uma falha severa, altera o status para invalidar garantias
        batteries[_id].status = Status.RiscoCritico;
        
        emit FailureReported(_id, _errorCode);
        emit StatusChanged(_id, Status.RiscoCritico);
    }

    // --- Consultas  ---

    // Consultar dados gerais da bateria
    function getBatteryInfo(string memory _id) public view returns (string memory, uint8, Status, address) {
        require(batteries[_id].isRegistered, "Bateria nao encontrada");
        Battery memory b = batteries[_id];
        return (b.manufacturer, b.stateOfHealth, b.status, b.owner);
    }

    // Consultar total de manutenções registradas
    function getMaintenanceCount(string memory _id) public view returns (uint256) {
        return maintenanceHistories[_id].length;
    }

    // Consultar uma manutenção específica pelo índice
    function getMaintenance(string memory _id, uint256 _index) public view returns (uint256, string memory, address) {
        require(_index < maintenanceHistories[_id].length, "Indice fora do limite");
        MaintenanceRecord memory m = maintenanceHistories[_id][_index];
        return (m.date, m.description, m.technician);
    }
}