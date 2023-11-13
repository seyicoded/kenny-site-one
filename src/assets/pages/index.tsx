import { useEffect } from "react"
import { useLocation } from "react-router-dom"

type Props = {}

export default function FrontPage({}: Props) {

    const location = useLocation()
    useEffect(()=>{
        if(location.pathname == "/"){
            window.location.replace("/web-consultation")
        }
    }, [])
    return (
        <div>Index</div>
    )
}