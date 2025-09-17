export default function AddressForm({ value, onChange }){
  const v = value || {}
  const set = (key, val) => onChange({ ...v, [key]: val })
  return (
    <div className="form">
      <div className="row">
        <input placeholder="Full name" value={v.name||''} onChange={e=>set('name', e.target.value)} />
        <input placeholder="Phone (10 digits)" value={v.phone||''} onChange={e=>set('phone', e.target.value)} />
      </div>
      <div className="row">
        <input placeholder="Pincode" value={v.pincode||''} onChange={e=>set('pincode', e.target.value)} />
        <input placeholder="City" value={v.city||''} onChange={e=>set('city', e.target.value)} />
      </div>
      <div className="row">
        <input placeholder="State" value={v.state||''} onChange={e=>set('state', e.target.value)} />
        <input placeholder="Landmark (optional)" value={v.landmark||''} onChange={e=>set('landmark', e.target.value)} />
      </div>
      <textarea rows="3" placeholder="Address (House no, Street, Area)"
        value={v.address1||''} onChange={e=>set('address1', e.target.value)} />
    </div>
  )
}
