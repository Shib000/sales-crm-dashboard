import { dataService } from './dataService'

export const authService = {
  login(email, password) {
    const users = dataService.getUsers()
    const user = users.find(
      u => u.email === email && u.password === password
    )
    
    if (user) {
      const { password: _, ...userWithoutPassword } = user
      return userWithoutPassword
    }
    
    return null
  }
}



