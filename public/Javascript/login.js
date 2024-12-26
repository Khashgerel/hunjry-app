document.addEventListener('DOMContentLoaded', () => {
    const loginButton = document.querySelector('.login-button button');
    
    loginButton.addEventListener('click', async (e) => {
        e.preventDefault();
        
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value.trim();

        console.log('Attempting login with:', { username, password });

        if (!username || !password) {
            alert('Нэвтрэх нэр болон нууц үгээ оруулна уу');
            return;
        }

        try {
            const response = await fetch('/api/users');
            const userData = await response.json();
            
            console.log('User data received:', userData);
            
            // Find matching user
            const user = userData.users.find(
                u => u.username.toLowerCase() === username.toLowerCase() && 
                     u.password === password
            );

            console.log('Found user:', user);

            if (user) {
                // Store user info in localStorage
                const userInfo = {
                    userId: user.userId,
                    username: user.username,
                    email: user.email,
                    phoneNumber: user.phoneNumber,
                    address: user.address,
                    likedFoods: user.likedFoods || []
                };
                
                localStorage.setItem('user', JSON.stringify(userInfo));
                window.location.href = '/htmls/nuur.html';
            } else {
                alert('Нэвтрэх нэр эсвэл нууц үг буруу байна');
            }
        } catch (error) {
            console.error('Login error:', error);
            alert('Нэвтрэх үед алдаа гарлаа');
        }
    });
}); 