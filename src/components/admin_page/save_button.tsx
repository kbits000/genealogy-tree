'use client'

import { useState } from 'react'

import Button from '@mui/material/Button';

export default function SaveButton() {
    const [loading, setLoading] = useState(false);
    return (
        <Button
            type={'submit'}
            variant="contained"
        >
            حفظ
        </Button>
    )
}