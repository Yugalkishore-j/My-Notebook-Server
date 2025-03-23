const express = require('express');
const router = express.Router();
const Note = require('../models/Note');
const fetchuser = require('../middleware/fetchuser');
const { body, validationResult } = require('express-validator');

// R1--Get All The Note of User GET "/api/notes/getuser". login required
router.get('/fetchallnotes', fetchuser, async (req, res) => {
    try {
        const notes = await Note.find({ user: req.user.id })
        res.json(notes);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });

    }
})

// R2-- Add a New Note of User GET "/api/notes/addNote". login required
router.post('/addnote', fetchuser, [
    body('title').isLength({ min: 3 }),
    body('description', "description must be 5 characters").isLength({ min: 5 }),
], async (req, res) => {
    try {
        const { title, description, tag } = req.body;
        //if there are errors, return bad request.
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const note = new Note({
            title, description, tag, user: req.user.id
        })
        const savedNote = await note.save()
        res.json(savedNote);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
})


// R3-- Update an existing Note of User PUT "/api/notes/updatenote". login required

router.put('/updatenote/:id', fetchuser, async (req, res) => {
    const { title, description, tag } = req.body;
    try {

        // Create a newNote object
        const newNote = {};
        if (title) { newNote.title = title };
        if (description) { newNote.description = description };
        if (tag) { newNote.tag = tag };

        // Find the note to be updated and update it
        let note = await Note.findById(req.params.id);

        if (!note) { return res.status(401).send("Notes Not Found") };

        if (note.user.toString() !== req.user.id) {
            return res.status(401).send("Not Allowed")
        };
        note = await Note.findByIdAndUpdate(req.params.id, { $set: newNote }, { new: true })
        res.json({ note })
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// R4-- Delete an existing Note of User DELETE "/api/notes/deletenote". login required

router.delete('/deletenote/:id', fetchuser, async (req, res) => {
    const { title, description, tag } = req.body;
    try {


        // Delete an existing Note .
        let note = await Note.findById(req.params.id);
        if (!note) { return res.status(401).send("Not Found") };

        //Allow only User own the Note
        if (note.user.toString() !== req.user.id) {
            return res.status(401).send("Not Allowed")
        }

        note = await Note.findByIdAndDelete(req.params.id)
        res.json({ "Success": "Note has been deleted", note: note })
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


module.exports = router;


