const db = require("../modules/db")

exports.uploadProfile = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({error: "no file uploaded"})
          
         const id = req.user.id
         const filepath = req.file.filename    

        await db.query("UPDATE users SET img_url= $1 WHERE id = $2", [filepath, id])
        res.json({
            succes: true,
            message: "succesfully updated profile picture",
            filename: req.file.filename
        })
        console.log(filepath)
    } catch (error) {
        res.status(500).json({error: error.message})
    }
}