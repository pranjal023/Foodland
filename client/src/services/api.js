import axios from 'axios'


const BASE = 'https://www.themealdb.com/api/json/v1/1'

function randPrice(){
  
  return Math.floor(Math.random() * 280) + 120
}

function mealToItem(m){
  return {
    id: m.idMeal,
    name: m.strMeal,
    img: m.strMealThumb,
    dsc: m.strCategory || m.strArea || '',
    price: randPrice(),
    rate: (Math.random() * 2 + 3).toFixed(1)
  }
}


export async function fetchCategories(){
  const { data } = await axios.get(`${BASE}/categories.php`)
  return (data?.categories || []).map(c => c.strCategory)
}


export async function fetchByCategory(category){
  const { data } = await axios.get(`${BASE}/filter.php`, { params: { c: category }})
  return (data?.meals || []).map(mealToItem)
}


export async function searchFoods(q, limit=24){
  const { data } = await axios.get(`${BASE}/search.php`, { params: { s: q }})
  const items = (data?.meals || []).map(mealToItem)
  return items.slice(0, limit)
}
