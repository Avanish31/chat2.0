import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider, createBrowserRouter ,BrowserRouter} from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import Home from './pages/Home.jsx'
import Signup from './features/auth/components/Signup.jsx'
import Signin from './features/auth/components/Signin.jsx'
import Chat from './features/chat/components/Chat.jsx'
import { Provider } from 'react-redux'
import store from './store.js'
const router=createBrowserRouter([
  {
    path:'/',
    element:<App/>,
    children:[
      {
        path:'/',
        element:<Home/>
      },
      {
        path:"/signup",
        element:<Signup/>
      },
      {
        path:"/signin",
        element:<Signin/>
      },
      {
        path:'/chat',
        element:<Chat/>
      },{
        path:'/chat/:id',
        element:<Chat/>
      }
    ]
  }
])

createRoot(document.getElementById('root')).render(
    <Provider store={store}>
    <RouterProvider router={router}/>
    </Provider>
    
)
