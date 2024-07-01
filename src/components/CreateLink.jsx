import { urlState } from '@/context'
import React, { useState, useRef, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from './ui/input';
import { Card } from './ui/card';
import Error from './Error';
import { Button } from './ui/button';
import * as yup from "yup"
import useFetch from '@/hooks/useFetch';
import { createUrl } from '@/db/apiUrls';
import { BeatLoader } from 'react-spinners';
import { QRCode } from 'react-qrcode-logo';


function CreateLink() {
    const { user } = urlState();
    const navigate = useNavigate();
    const ref = useRef();

    let [searchParams, setSearchParams] = useSearchParams();
    const longLink = searchParams.get("createNew");

    const [errors, setErrors] = useState({});
    const [formValues, setFormValues] = useState({
        title: "",
        longUrl: longLink ? longLink : "",
        customUrl: ""
    })

    const schema = yup.object().shape({
        title: yup.string().required("Title is required"),
        longUrl: yup.string().url("Must be a valid Url").required("Long Url is required"),
        customUrl: yup.string()
    })

    const handleChange = (e) => {
        setFormValues({
            ...formValues,
            [e.target.id]: e.target.value
        })
    }

    const { loading, error, data, fn: fnCreateUrl } = useFetch(createUrl, { ...formValues, user_id: user.id })

    useEffect(() => {
        if (error === null && data) {
            navigate(`/link/${data[0].id}`)
        }
    }, [error, data])

    const createNewLink = async () => {
        setErrors([]);
        try {
            await schema.validate(formValues, { abortEarly: false })
            const canvas = ref.current.canvasRef.current;
            const blob = await new Promise((resolve) => canvas.toBlob(resolve))

            await fnCreateUrl(blob);
        } catch (error) {
            const newErrors = {};

            error?.inner?.forEach((err) => {
                newErrors[err.path] = err.message
            })

            setErrors(newErrors)
        }
    }

    return (
        <Dialog defaultOpen={longLink}
            onOpenChange={(res) => {
                if (!res) setSearchParams({})
            }}
        >
            <DialogTrigger variant="destructive">Create New Link</DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader className="font-bold text-2xl">
                    <DialogTitle>Create New</DialogTitle>
                </DialogHeader>

                {formValues?.longUrl && (
                    <QRCode value={formValues?.longUrl} size={250} ref={ref} />
                )}

                <Input id="title" placeholder="Short Link Title"
                    value={formValues.title}
                    onChange={handleChange}
                />
                {errors.title && <Error message={errors.title} />}

                <Input id="longUrl" placeholder="Enter your Looong URL"
                    value={formValues.longUrl}
                    onChange={handleChange}
                />
                {errors.longUrl && <Error message={errors.longUrl} />}

                <div className='flex items-center gap-2'>
                    <Card className="p-2">trimrr.com</Card>
                    /
                    <Input id="customUrl" placeholder="Custom Link (optional)"
                        value={formValues.customUrl}
                        onChange={handleChange}
                    />
                </div>
                {error && <Error message={error.message} />}

                <DialogFooter className="sm:justify-start">
                    <Button
                        disabled={loading}
                        onClick={createNewLink}
                        variant="destructive">
                        {loading ? <BeatLoader size={10} color='white' /> : "Create"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default CreateLink