/**

    ******* Using http only cookies ******* 
 _____________________________________________

  1. from client side send the information (email, better: firebase auth token) to generate token.

  2. on the server side, accept user information and if needed validate it

  3. generate token in the server side using secret and expireIn

    ---------------
    set the cookie
    ---------------

  4. while calling the api tell to use withCredentials

        axios.post("http://localhost:3000/jwt", userData, {
            withCredentials: true,
          })
        
    or for fetch add option credentials: 'include'
 
  5. in the cors setting set credentials and origin

        app.use(
          cors({
            origin: ["http://localhost:5173"],
            credentials: true,
          })
        );

  6. after generating the token set it to the cookies with some options

        res.cookie("token", token, {
            httpOnly: true,
            secure: false,
        });


    ----------------

  7. One time : use cookiesParser as middleware
  8. for every api you want to verify token *:
    in the client side : 
        if using axios -> withCredentials: true
        for fetch -> credentials: 'include'

    -----------------
    verify cookie
    -----------------

  9. check token exists.
          If not, return 401 that's mean unauthorized access 
            if (!token) res.status(401).send({ message: "unauthorized access" });
        
  10. jwt.verify() -> 
          If err, return 401 that's mean unauthorized access
            if (err) res.status(401).send({ message: "unauthorized access" });
  
  11. IF token is valid set the decoded value to the req object
  
  12. IF data asking for doesn't match with the owner of bearer of the token
      403 --> forbidden access

          if (email !== req.decoded.email) {
            return res.status(403).send({ message: "forbidden access" });
          }



JWT_SECRET_ACCESS = klsdjfksajfdpfoidajspodfjdasopdfjpasodjfpoasdjfiposaf
                      for create in terminal command:  node then -> 
                          require('crypto').randomBytes(64).toString('hex')
                  value will be ==> klsdjfksajfdpfoidajspodfjdasopdfjpasodjfpoasdjfiposaf
 */
