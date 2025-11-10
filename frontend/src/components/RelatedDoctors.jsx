import React, { useContext, useState, useEffect } from 'react'
import { AppContext } from '../context/AppContext'
import { useNavigate } from 'react-router-dom';


const RelatedDoctors = ({ docId, speciality }) => {


    const { doctors } = useContext(AppContext);



    const [relDocs, setRelDocs] = useState([])

    const fetchRelatedDoctors = () => {
        if (doctors.length > 0 && speciality) {
            const relatedDocs = doctors.filter((doc) => doc.speciality === speciality && doc._id !== docId)
            setRelDocs(relatedDocs)
        }

    }

    useEffect(() => {
        fetchRelatedDoctors();
    }, [doctors, docId, speciality])

    const navigate = useNavigate();

    return (
        <div className='flex flex-col items-center gap-4 text-gray-900 my-16 md:mx-10'>
            <h1 className='text-3xl font-medium'>Related Doctors to Book</h1>
            <p className='sm:w-1/3 text-sm text-center'>Simply browse through our extensive list of trusted doctors</p>
            <div className='w-full grid grid-cols-auto gap-4 pt-5 gap-y-6 sm:px-0'>
                {
                    relDocs.slice(0, 5).map((item, index) => (
                        <div onClick={() => { navigate(`/appoinment/${item._id}`); scrollTo(0, 0) }} className='border border-blue-200 rounded-xl overflow-hidden cursor-pointer hover:translate-y-[-10px] transition-all duration-500' key={index}>
                            <img className='bg-blue-50' src={item.image} alt="" />
                            <div className='p-4'>
                                <div className='flex items-center gap-2 text-sm text-green-500'>
                                    <p className={`w-2 h-2 ${item.available ? "bg-green-500" : "bg-red-600"} rounded-full`}></p><p className={`${item.available ? "text-green-500" : "text-red-500"}`}>{item.available ? "available" : "not available"}</p>
                                </div>
                                <p className='text-gray-900 text-lg font-medium'>{item.name}</p>
                                <p className='text-gray-600 text-sm'>{item.speciality}</p>
                            </div>

                        </div>

                    ))}
            </div>
            <button onClick={() => { navigate('/doctors'); scrollTo(0, 0) }} className='bg-blue-100 text-gray-600 px-8 py-3 rounded-full mt-10'>more</button>

        </div>
    )
}

export default RelatedDoctors
