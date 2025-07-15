const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.signup = async (req, res) => {
  try {
    const newUser = req.body;
    
    const unameRegex = /^[a-zA-Z0-9_]*$/
    if(!unameRegex.test(newUser.username)){
      return res.status(400).send({error:"Username can only contain letters, numbers and underscore"})
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if(!emailRegex.test(newUser.email)){
      return res.status(400).send({error:"Invalid email"})
    }


    const pwdRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*_\-+=])[^\s]{8,}$/
    if(!pwdRegex.test(newUser.password)){
      return res.status(400).send({error:"Password must be at least 8 characters long, contain uppercase and lowercase letters, a digit, a special character, and no spaces." })
    }

    if (isNaN(newUser.balance) || newUser.balance < 0){
      return res.status(400).send({error:"Invalid input for balance"})
    }


    const takenUserEmail = await User.findOne({ email: newUser.email });
    const takenUsername = await User.findOne({ username: newUser.username });
    if (takenUserEmail || takenUsername) {
      return res
        .status(403)
        .send({ error: "Username or Email already registered" });
    }  //-> already taken care of in checkUser but still, used to protect against possible attacks
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newUser.password, salt);
    const user = new User({
      username: newUser.username,
      email: newUser.email,
      password: hashedPassword,
      balance: newUser.balance,
    });
    await user.save();
    
    //added payload and sign to signup as well
    const payload = {id: user._id, username: user.username}

    jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRY * 24 * 60 * 60 },
        (error, token) => {
            if (error) {
                console.error('Error generating jwt:', error.message)
                return res.status(500).send({ error: 'Error generating token' })
            }
            return res
                  .status(201)
                  .send({ message: "Successfully registered new user" , accessToken: token});        
        }
    )

  } catch (error) {
    console.error("Error registering user:", error.message);
    return res.status(500).send({ error: "Error registering user" });
  }
};

exports.login = async (req, res) => {

    try{
      const user = req.body;
    const existingUser = await User.findOne({ email: user.email });
    if (!existingUser) {
      return res.status(401).send({ error: "Invalid username or password" });
    }
    const isValidPassword = await bcrypt.compare(user.password, existingUser.password);
    if (!isValidPassword) {
      return res.status(401).send({ error: "Invalid username or password" });
    }
    const payload = { id: existingUser._id, username: existingUser.username }
    jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRY * 24 * 60 * 60 },
        (error, token) => {
            if (error) {
                console.error('Error generating jwt:', error.message)
                return res.status(400).send({ error: 'Invalid credentials' })
            }
            return res.status(200).send({ message: 'Successfully logged in', accessToken: token })
        }
    )
    }catch(error){
      console.error("Error logging in", error.message)
      return res.status(400).send({error: "Error logging in"})
    }
};

exports.checkUser = async (req, res) => {
  try{
    const user = req.body

  const unameRegex = /^[a-zA-Z0-9_]*$/
  if(!unameRegex.test(user.username)){
    return res.status(400).send({error:"Username can only contain letters, numbers and underscore"})
  }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if(!emailRegex.test(user.email)){
      return res.status(400).send({error:"Invalid email"})
    }


    const pwdRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*_\-+=])[^\s]{8,}$/
    if(!pwdRegex.test(user.password)){
      return res.status(400).send({error:"Password must be at least 8 characters long, contain uppercase and lowercase letters, a digit, a special character, and no spaces."})
    }
  const takenUserEmail = await User.findOne({email: user.email})
  const takenUserName = await User.findOne({username: user.username})

  if (takenUserName || takenUserEmail){
    return res.status(403).send({exists: true, error: "Username or Email already registered" });
  }
  return res.status(200).send({exists: false})
  }
  catch(error){
    console.error("Error in user check in", error.message)
    return res.status(400).send({error:"Error in user input validation"})
  }
}

exports.getKey=async(req,res)=>{
  try{
    const auth = req.headers.authorization
    if(!auth)return res.status(401).send({error: "Unauthorized"})
    const token = auth.split(' ')[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(decoded.id)
    if(!user){
      return res.status(404).send({error:"User not found"})
    }
    const key=user.encryptionKey.toString("base64");
    return res.status(200).send({key: key})
  }catch(error){
    console.error("Error in getting key", error.message)
    return res.status(400).send({error:"Error in getting key"})
  }
}