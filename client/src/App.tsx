import { BrowserRouter ,Routes, Route} from 'react-router-dom';
import LoginPage from './components/Login';
import HomePage from './components/Home';

function App() {
  return (
    <div>
      <BrowserRouter>
        <Routes>
            <Route path='/' element={<LoginPage/>}></Route>
            <Route path='/home' element={<HomePage/>}></Route>
          </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
