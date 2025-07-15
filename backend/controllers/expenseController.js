const expenses = require('../models/expenseModel')
const users = require('../models/userModel')

exports.getAllExpenses= async(req,res)=>{
    const id=req.params.id
    try {
        const history = await expenses.find({userId:id})
        return res.status(200).send({history:history})
    }catch(error){
        console.error('Error fetching expenses history',error.message)
        res.status(500).send({error:'Error fetching expenses history'}) //error
    }
}

exports.createExpense=async(req,res)=>{
    var expense=req.body.encryptedData
    expense.userId=req.body.userId
    try{
        if(isNaN(expense.amount) || expense.amount <=0){
            return res.status(400).send({error: "Please enter a valid amount"})
        }
        const newExpense=new expenses(expense)
        const user=await users.findById(expense.userId)
        if(user.balance<expense.amount){
            return res.status(400).send({error:'Insufficient balance'})
        }
        const savedExpense=await newExpense.save()
        user.balance=user.balance-expense.amount
        const updatedUser = await users.findByIdAndUpdate( expense.userId , {balance:user.balance},{new:true})
        const newBalance=user.balance
        return res.status(201).send({message:'Expense created successfully',savedExpense, newBalance}) //send updated User (with remaining balance updated) as well which could be used to update UI immediately
    }catch(error){
        console.error('Error creating expense',error.message)
        return res.status(500).send({error:'Error creating expense'})
    }
}

exports.editExpense=async(req,res)=>{
    const id=req.params.id
    const newExpense=req.body

    const updateFields={}
    if (newExpense.title !== undefined) updateFields.title=newExpense.title
    if (newExpense.amount !== undefined && !isNaN(newExpense.amount) && newExpense.amount > 0) updateFields.amount=newExpense.amount
    else return res.status(400).send({error:"Please enter a valid amount"}) //
    if (newExpense.category !== undefined) updateFields.category=newExpense.category
    if (newExpense.note !== undefined) updateFields.note=newExpense.note
    //if (newExpense.date !== undefined) updateFields.date=newExpense.date removed as date is a default attribute

    try{
        var amountDifference=0
        const existingExpense=await expenses.findById(id)
        if(!existingExpense){
                return res.status(404).send({error:"Expense not found"})
        }  

        if(updateFields.amount!==undefined){
            // amountDifference=existingExpense.amount-updateFields.amount
            if(updateFields.amount<0){
                return res.status(400).send({message:'Invalid amount',error:'Invalid amount'})
            }
            amountDifference = updateFields.amount - existingExpense.amount
            
            // const user=await users.findById(existingExpense.userId)
            // const newBalance=user.balance+amountDifference
            // const updatedUser=await users.findByIdAndUpdate(existingExpense.userId,{balance:newBalance},{new:true}) // gives the updates user info after updating the balance
        }
        const user=await users.findById(existingExpense.userId)
        if (!user) {
            return res.status(404).send({ error: "User not found" });
        }

        const newBalance=user.balance-amountDifference
        if (newBalance < 0) {
            return res.status(400).send({ error: "Insufficient balance" });
        }

        const updatedUser=await users.findByIdAndUpdate(existingExpense.userId,{balance:newBalance},{new:true}) // gives the updated user info after updating the balance
        
        const updatedExpense=await expenses.findByIdAndUpdate(id,updateFields,{new:true})
        // if(!updatedExpense){
        //     return res.status(400).send({message:"Expense not found"})
        // }
        return res.status(200).send({message:"Expense updated successfully",updatedExpense,updatedUser})

    }catch(error){
        console.error('Error updating expense',error.message)
        return res.status(400).send({error:"Error updating expense"})
    }
}

exports.deleteExpense=async(req,res)=>{
    const id=req.params.id
    try {
        const deletedExpense = await expenses.findByIdAndDelete(id); //id should be enough
        if(!deletedExpense){
            return res.status(404).send({error:'Expense not found'})
        }
        const user = await users.findById(deletedExpense.userId)
        if(!user){
            return res.status(404).send({error:"User not found"})
        }
        user.balance += deletedExpense.amount
        const savedUser = await user.save()
        return res.status(200).send({message:'Expense deleted successfully',savedUser})
    }catch(error){
        console.error('Error deleting expense',error.message)
        return res.status(500).send({error:'Error deleting expense'})
    }
}

