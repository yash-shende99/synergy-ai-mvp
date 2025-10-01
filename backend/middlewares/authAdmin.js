import jwt from "jsonwebtoken"


const authAdmin=async(req,res,next)=>{
    try{
        
        const {atoken} =req.headers

        if(!atoken){
            return res.status(404).json({
                success:false,
                message:'Not Authorised Login again'
            })
        }
        const token_decoded=jwt.verify(atoken,process.env.JWT_SECRET)

        if(token_decoded!==process.env.ADMIN_EMAIL+process.env.ADMIN_PASSWORD){
            return res.status(404).json({
                success:false,
                message:'Not Authorised Login again'
            })
        }

        next()


    }
    catch(error){
        console.log(error)
        res.status(500).json({
            success:false,
            message:error.message
        })

    }

}

export default authAdmin