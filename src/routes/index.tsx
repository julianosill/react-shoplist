import { Routes, Route } from 'react-router-dom'

import Login from '../pages/Login'
import List from '../pages/List'

import Private from './Private'

export default function RoutesApp() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route
        path="/list"
        element={
          <Private>
            <List />
          </Private>
        }
      />
    </Routes>
  )
}
