import { useEffect, useMemo, useState } from 'react'
import CategoryFilter from '../components/CategoryFilter.jsx'
import FoodCard from '../components/FoodCard.jsx'
import { fetchCategories, fetchByCategory, searchFoods } from '../services/api.js'
import { useLocation } from 'react-router-dom'

function useQuery(){
  const { search } = useLocation()
  return useMemo(() => new URLSearchParams(search), [search])
}

export default function Home(){
  const [categories, setCategories] = useState([])
  const [category, setCategory] = useState('Beef')
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const qs = useQuery()
  const q = qs.get('q') || ''

  useEffect(() => {
    let ignore = false
    async function loadCats(){
      try{
        const cats = await fetchCategories()
        if (!ignore){
          setCategories(cats)
          if (!cats.includes(category) && cats.length) setCategory(cats[0])
        }
      }catch(e){ console.error(e) }
    }
    loadCats()
    return () => { ignore = true }
  }, [])

  useEffect(() => {
    let ignore = false
    async function run(){
      setLoading(true)
      try {
        let items = []
        if (q) {
          items = await searchFoods(q, 30)
        } else {
          items = await fetchByCategory(category)
        }
        if (!ignore) setData(items)
      } catch (e){
        console.error(e)
        if (!ignore) setData([])
      } finally {
        setLoading(false)
      }
    }
    run()
    return () => { ignore = true }
  }, [category, q])

  return (
    <div>
      <div className="banner">
        <strong>Delivering to you in ~30 min.</strong> Browse by category or search dishes.
      </div>

      {!q && (
        <CategoryFilter
          categories={categories}
          active={category}
          onChange={setCategory}
        />
      )}

      {loading ? <p>Loading...</p> : (
        <div className="grid">
          {data.map(item => <FoodCard key={item.id} item={item} />)}
          {data.length === 0 && <p>No items found.</p>}
        </div>
      )}
    </div>
  )
}
