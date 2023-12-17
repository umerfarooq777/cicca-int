import logo from './logo.svg';
import './App.css';
import { GetCiccaContext } from './context/ciccaContext';

function App() {

  const {isLoading} = GetCiccaContext()


  return (
    <div className="App">
      <header className="App-header">
        <h4>CICCA APP</h4>
      </header>
    </div>
  );
}

export default App;
