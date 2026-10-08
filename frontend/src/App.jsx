import { useState } from 'react';
import { ethers } from 'ethers';
import abiData from './EVBatteryPassport.json';

// Cole o endereço gerado no deploy aqui
const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; 
const CONTRACT_ABI = abiData.abi;

function App() {
  const [wallet, setWallet] = useState("");
  
  // Estados - Leitura
  const [batteryId, setBatteryId] = useState("");
  const [batteryInfo, setBatteryInfo] = useState(null);
  const [maintenanceList, setMaintenanceList] = useState([]);

  // Estados - Admin
  const [newBatteryId, setNewBatteryId] = useState("");
  const [manufacturer, setManufacturer] = useState("");
  const [ownerAddress, setOwnerAddress] = useState("");
  const [authAddress, setAuthAddress] = useState("");

  // Estados - BMS e Oficina
  const [updateId, setUpdateId] = useState("");
  const [newSoH, setNewSoH] = useState("");
  const [maintId, setMaintId] = useState("");
  const [maintDesc, setMaintDesc] = useState("");
  
  // Estados - Falhas (BMS)
  const [failId, setFailId] = useState("");
  const [errorCode, setErrorCode] = useState("");
  const [severity, setSeverity] = useState("");

  // Conectar com a carteira
  async function connectWallet() {
    if (window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        setWallet(await signer.getAddress());
      } catch (error) {
        console.error("Erro:", error);
      }
    } else {
      alert("Instale o MetaMask!");
    }
  }

  // --- Funções do Admin ---
  async function handleRegisterBattery() {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      
      const tx = await contract.registerBattery(newBatteryId, manufacturer, ownerAddress);
      await tx.wait();
      alert("Bateria registrada com sucesso!");
    } catch (error) {
      console.error(error);
      alert("Erro ao registrar.");
    }
  }

  async function handleSetInUse() {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      
      const tx = await contract.setInUse(newBatteryId);
      await tx.wait();
      alert(`Status da bateria ${newBatteryId} alterado para "Em Uso"!`);
    } catch (error) {
      console.error(error);
      alert("Erro ao mudar o status. Verifique se o contrato foi atualizado.");
    }
  }

  async function handleAuthorize(role) {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      
      let tx;
      if (role === 'oracle') tx = await contract.authorizeOracle(authAddress);
      if (role === 'workshop') tx = await contract.authorizeWorkshop(authAddress);
      
      await tx.wait();
      alert("Endereço autorizado com sucesso!");
    } catch (error) {
      console.error(error);
      alert("Erro: Apenas o Admin pode autorizar.");
    }
  }

  // --- Funções BMS / Oficina ---
  async function handleUpdateHealth() {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      
      const tx = await contract.updateHealth(updateId, newSoH);
      await tx.wait();
      alert("Saúde (SoH) atualizada!");
    } catch (error) {
      console.error(error);
      alert("Erro: Verifique se este endereço está autorizado como Oracle (BMS).");
    }
  }

  async function handleReportFailure() {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      
      const tx = await contract.reportFailure(failId, errorCode, severity);
      await tx.wait();
      alert("Falha crítica reportada com sucesso!");
    } catch (error) {
      console.error(error);
      alert("Erro ao reportar falha. Apenas o BMS (Oracle) autorizado pode fazer isto.");
    }
  }

  async function handleLogMaintenance() {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      
      const tx = await contract.logMaintenance(maintId, maintDesc);
      await tx.wait();
      alert("Manutenção registrada!");
    } catch (error) {
      console.error(error);
      alert("Erro: Verifique se este endereço está autorizado como Oficina.");
    }
  }

  // --- Função de Leitura Pública ---
  async function handleGetBatteryInfo() {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
      
      // 1. Puxa os dados gerais
      const info = await contract.getBatteryInfo(batteryId);
      const statusMap = ["Fabricada", "Em Uso", "Segunda Vida", "Reciclada", "Risco Crítico"];
      
      setBatteryInfo({
        manufacturer: info[0],
        soh: info[1].toString(),
        status: statusMap[info[2]],
        owner: info[3]
      });

      // 2. Puxa o histórico de reparações
      const count = await contract.getMaintenanceCount(batteryId);
      let records = [];
      for (let i = 0; i < count; i++) {
        const record = await contract.getMaintenance(batteryId, i);
        const dataFormatada = new Date(Number(record[0]) * 1000).toLocaleString();
        
        records.push({
          date: dataFormatada,
          description: record[1],
          technician: record[2]
        });
      }
      setMaintenanceList(records);

    } catch (error) {
      alert("Bateria não encontrada.");
      setBatteryInfo(null);
      setMaintenanceList([]);
    }
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial', maxWidth: '900px', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center' }}>Passaporte de Baterias EV</h1>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
        <button onClick={connectWallet} style={{ padding: '10px 20px', background: 'blue', color: 'white', cursor: 'pointer', borderRadius: '5px', border: 'none' }}>
          {wallet ? `Conectado: ${wallet.substring(0,6)}...${wallet.substring(38)}` : "Conectar MetaMask"}
        </button>
      </div>

      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        {/* Painel Admin */}
        <div style={{ flex: '1 1 400px', border: '2px solid #333', padding: '15px', borderRadius: '8px' }}>
          <h3 style={{ marginTop: 0 }}>Painel Admin</h3>
          
          <div style={{ marginBottom: '20px', padding: '10px', background: '#f9f9f9' }}>
            <h4>1. Autorizar Acessos</h4>
            <input type="text" placeholder="Endereço (0x...)" value={authAddress} onChange={e => setAuthAddress(e.target.value)} style={{ width: '95%', padding: '8px', marginBottom: '10px' }} />
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => handleAuthorize('oracle')} style={{ flex: 1, padding: '8px', cursor: 'pointer' }}>Autorizar BMS</button>
              <button onClick={() => handleAuthorize('workshop')} style={{ flex: 1, padding: '8px', cursor: 'pointer' }}>Autorizar Oficina</button>
            </div>
          </div>
          
          <div style={{ padding: '10px', background: '#f9f9f9' }}>
            <h4>2. Gestão de Baterias</h4>
            <input type="text" placeholder="ID (ex: BAT-001)" value={newBatteryId} onChange={e => setNewBatteryId(e.target.value)} style={{ width: '95%', padding: '8px', marginBottom: '5px' }} />
            <input type="text" placeholder="Fabricante" value={manufacturer} onChange={e => setManufacturer(e.target.value)} style={{ width: '95%', padding: '8px', marginBottom: '5px' }} />
            <input type="text" placeholder="Endereço do Dono Inicial" value={ownerAddress} onChange={e => setOwnerAddress(e.target.value)} style={{ width: '95%', padding: '8px', marginBottom: '10px' }} />
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button onClick={handleRegisterBattery} style={{ padding: '10px', background: '#222', color: 'white', cursor: 'pointer', border: 'none' }}>Registrar Bateria</button>
              <button onClick={handleSetInUse} style={{ padding: '10px', background: '#28a745', color: 'white', cursor: 'pointer', border: 'none' }}>Marcar Bateria como "Em Uso"</button>
            </div>
          </div>
        </div>

        {/* Painéis Secundários */}
        <div style={{ flex: '1 1 400px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px' }}>
            <h3 style={{ marginTop: 0 }}>BMS (IoT) - Telemetria</h3>
            <input type="text" placeholder="ID da Bateria" value={updateId} onChange={e => setUpdateId(e.target.value)} style={{ width: '95%', padding: '8px', marginBottom: '5px' }} />
            <input type="number" placeholder="Novo SoH (%)" value={newSoH} onChange={e => setNewSoH(e.target.value)} style={{ width: '95%', padding: '8px', marginBottom: '10px' }} />
            <button onClick={handleUpdateHealth} style={{ width: '100%', padding: '10px', cursor: 'pointer' }}>Atualizar Saúde</button>

            <hr style={{ margin: '20px 0' }}/>
            
            <h4 style={{ marginTop: 0 }}>🚨 Reportar Falha Crítica</h4>
            <input type="text" placeholder="ID da Bateria" value={failId} onChange={e => setFailId(e.target.value)} style={{ width: '95%', padding: '8px', marginBottom: '5px' }} />
            <input type="text" placeholder="Código (ex: ERR-404)" value={errorCode} onChange={e => setErrorCode(e.target.value)} style={{ width: '95%', padding: '8px', marginBottom: '5px' }} />
            <input type="text" placeholder="Gravidade (Alta/Média)" value={severity} onChange={e => setSeverity(e.target.value)} style={{ width: '95%', padding: '8px', marginBottom: '10px' }} />
            <button onClick={handleReportFailure} style={{ width: '100%', padding: '10px', background: 'darkred', color: 'white', cursor: 'pointer', border: 'none' }}>Registrar Falha</button>
          </div>

          <div style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px' }}>
            <h3 style={{ marginTop: 0 }}>🔧 Oficina - Histórico</h3>
            <input type="text" placeholder="ID da Bateria" value={maintId} onChange={e => setMaintId(e.target.value)} style={{ width: '95%', padding: '8px', marginBottom: '5px' }} />
            <input type="text" placeholder="Descrição do serviço" value={maintDesc} onChange={e => setMaintDesc(e.target.value)} style={{ width: '95%', padding: '8px', marginBottom: '10px' }} />
            <button onClick={handleLogMaintenance} style={{ width: '100%', padding: '10px', cursor: 'pointer' }}>Registrar Manutenção</button>
          </div>
          
        </div>
      </div>

      {/* Consulta Pública */}
      <div style={{ marginTop: '30px', border: '2px solid #0056b3', padding: '20px', borderRadius: '8px', background: '#f4f8ff' }}>
        <h2 style={{ marginTop: 0, color: '#0056b3', textAlign: 'center' }}>Público: Consultar Bateria</h2>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
          <input type="text" placeholder="ID da Bateria a pesquisar" value={batteryId} onChange={e => setBatteryId(e.target.value)} style={{ width: '50%', padding: '10px' }} />
          <button onClick={handleGetBatteryInfo} style={{ padding: '10px 20px', background: '#0056b3', color: 'white', border: 'none', cursor: 'pointer' }}>Consultar Passaporte</button>
        </div>
        
        {batteryInfo && (
          <div style={{ marginTop: '20px', background: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #b8daff', display: 'flex', justifyContent: 'space-around' }}>
            <div>
              <p style={{ margin: '5px 0' }}><strong>ID:</strong> {batteryId}</p>
              <p style={{ margin: '5px 0' }}><strong>Fabricante:</strong> {batteryInfo.manufacturer}</p>
              <p style={{ margin: '5px 0' }}><strong>Dono Atual:</strong> <span style={{ fontSize: '0.85em' }}>{batteryInfo.owner}</span></p>
            </div>
            <div>
              <p style={{ margin: '5px 0', fontSize: '1.2em' }}><strong>Saúde (SoH):</strong> <span style={{ color: batteryInfo.soh > 70 ? 'green' : 'red' }}>{batteryInfo.soh}%</span></p>
              <p style={{ margin: '5px 0', fontSize: '1.2em' }}><strong>Status:</strong> <span style={{ background: '#eee', padding: '2px 8px', borderRadius: '4px' }}>{batteryInfo.status}</span></p>
            </div>
          </div>
        )}

        {/* Histórico de Manutenções */}
        {maintenanceList.length > 0 && (
          <div style={{ marginTop: '15px', background: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #b8daff' }}>
            <h3 style={{ marginTop: 0, color: '#0056b3' }}>Histórico de Reparações ({maintenanceList.length})</h3>
            <ul style={{ paddingLeft: '20px', margin: 0 }}>
              {maintenanceList.map((maint, index) => (
                <li key={index} style={{ marginBottom: '15px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                  <span style={{ display: 'block', marginBottom: '5px' }}><strong>Data:</strong> {maint.date}</span>
                  <span style={{ display: 'block', marginBottom: '5px' }}><strong>Serviço:</strong> {maint.description}</span>
                  <span style={{ fontSize: '0.85em', color: '#666' }}><strong>Técnico (Endereço):</strong> {maint.technician}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;