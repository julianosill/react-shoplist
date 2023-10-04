import {
  ChangeEvent,
  FormEvent,
  MouseEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { db } from '../services/firebaseConnection'
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
} from 'firebase/firestore'

import LogoH from '../assets/logo-h.svg'
import { Button } from '../components/Button'
import { Input } from '../components/Input'
import * as Checkbox from '@radix-ui/react-checkbox'

import {
  Check,
  LogOut,
  PlusCircle,
  RefreshCw,
  ShoppingBasket,
  Tags,
  Trash2,
} from 'lucide-react'

interface Product {
  id: string
  name: string
  category: string
  created: Date
}

export default function List() {
  const [list, setList] = useState<Product[] | null>(null)
  const [categories, setCategories] = useState<string[]>([])
  const [loadingList, setLoadingList] = useState(true)
  const [loadingAdd, setLoadingAdd] = useState(false)
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [categoryFocus, setCategoryFocus] = useState(false)
  const [product, setProduct] = useState({
    name: '',
    category: '',
  })
  const categoryRef = useRef<HTMLDivElement | null>(null)

  const filteredCategories = useMemo(() => {
    return categories.filter((item) => {
      return item
        .toLocaleLowerCase()
        .includes(product.category.toLocaleLowerCase())
    })
  }, [categories, product.category])

  async function loadList() {
    const productsRef = collection(db, 'market')
    const q = query(productsRef, orderBy('created', 'desc'))
    await getDocs(q)
      .then((snapshot) => {
        const items: Product[] = []
        const cat: string[] = []
        snapshot.forEach((doc) => {
          const hasCategory = cat.includes(doc.data().category)
          items.push({
            id: doc.id,
            name: doc.data().name,
            category: doc.data().category,
            created: doc.data().created,
          })
          if (!hasCategory) {
            cat.push(doc.data().category)
          }
        })
        setList(items)
        setCategories(cat)
      })
      .catch((error) => console.log(error))
      .finally(() => setLoadingList(false))
  }

  const toggleSelectedItem = (e: MouseEvent<HTMLButtonElement>) => {
    const itemID = e.currentTarget.id
    selectedItems.includes(itemID)
      ? setSelectedItems(() => selectedItems.filter((e) => e !== itemID))
      : setSelectedItems([...selectedItems, itemID])
  }

  const handleChangeInput = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setProduct({ ...product, [name]: value })
  }

  async function addItem(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!product.name) {
      console.log('Name is empty')
      return
    }
    if (!product.category) {
      console.log('Category is empty')
      return
    }
    setLoadingAdd(true)
    await addDoc(collection(db, 'market'), {
      name: product.name,
      category: product.category,
      created: new Date(),
    })
      .then(() => {
        setProduct({ name: '', category: '' })
        loadList()
      })
      .catch((error) => console.log(error))
      .finally(() => setLoadingAdd(false))
  }

  async function removeItems() {
    try {
      const removeSelectedItems = selectedItems.map((docId) => {
        return deleteDoc(doc(db, 'market', docId))
      })
      await Promise.all(removeSelectedItems)
        .then(() => {
          loadList()
          setSelectedItems([])
        })
        .catch((error) => console.log(error))
    } catch (error) {
      console.log(error)
    }
  }

  const handleClickOutside = (e) => {
    if (!categoryRef.current?.contains(e.target)) {
      setCategoryFocus(false)
    }
  }

  useEffect(() => {
    loadList()
  }, [])

  useEffect(() => {
    document.addEventListener('click', handleClickOutside)
    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  }, [])

  // console.log('Rendering...')

  return (
    <div className="w-full min-h-screen bg-slate-700">
      <main className="w-10/12 max-w-2xl mx-auto flex flex-col gap-4">
        <header className="sticky top-0 flex justify-between items-center py-4 border-b-2 border-slate-600 bg-slate-700">
          <img src={LogoH} alt="SHOP List" className="w-40" />
          {selectedItems.length > 0 ? (
            <button
              onClick={removeItems}
              className="w-8 h-8 flex justify-center items-center border-2 border-slate-400 text-slate-400 rounded-md hover:bg-teal-500 hover:text-white hover:border-teal-500"
            >
              <Trash2 size={20} />
            </button>
          ) : (
            <div>
              <button
                onClick={removeItems}
                className="h-8 px-2 flex justify-center items-center gap-1 text-sm border border-slate-400 text-slate-400 rounded-md hover:text-teal-500 hover:border-teal-500"
              >
                Log out <LogOut size={18} />
              </button>
            </div>
          )}
        </header>
        {loadingList ? (
          <div className="py-10 flex flex-col items-center gap-4">
            <RefreshCw size={64} className="text-slate-500 animate-spin" />
            <h2 className="text-xl text-slate-100 animate-pulse">
              Loading your list...
            </h2>
          </div>
        ) : (
          <>
            <section className="flex-1">
              {categories.map((cat) => {
                const hasItems = list?.some((item) => item.category === cat)
                if (hasItems)
                  return (
                    <div
                      key={cat}
                      className="py-8 border-t-2 border-slate-600 first-of-type:border-none"
                    >
                      <h2 className="mb-2 flex items-center gap-2 text-2xl text-teal-500">
                        <Tags
                          strokeWidth={1}
                          size={26}
                          className="text-slate-500"
                        />
                        {cat}
                      </h2>
                      <ul className="text-white">
                        {list &&
                          list.map((item) => {
                            if (item.category === cat) {
                              const isSelected = selectedItems.includes(item.id)
                              return (
                                <li
                                  key={item.id}
                                  className={`px-4 flex justify-between items-center rounded-lg border-b last:border-0 border-slate-600/50 hover:bg-slate-800/50 ${
                                    isSelected && 'bg-slate-800/30'
                                  }`}
                                >
                                  <label
                                    htmlFor={item.id}
                                    className="flex-1 py-4 cursor-pointer"
                                  >
                                    {item.name}
                                  </label>
                                  <Checkbox.Root
                                    id={item.id}
                                    onClick={toggleSelectedItem}
                                    className="w-6 h-6 flex justify-center items-center border-2 border-slate-500 rounded-md data-[state=checked]:border-teal-500"
                                  >
                                    <Checkbox.Indicator>
                                      <Check
                                        size={18}
                                        strokeWidth={3}
                                        className="text-teal-500"
                                      />
                                    </Checkbox.Indicator>
                                  </Checkbox.Root>
                                </li>
                              )
                            }
                          })}
                      </ul>
                    </div>
                  )
              })}
            </section>
            <section className="sticky bottom-6 p-10 rounded-xl bg-white">
              <form onSubmit={addItem} className="flex flex-col gap-4">
                <div className="w-full relative">
                  <ShoppingBasket className="absolute h-12 left-4 text-slate-300" />
                  <Input
                    name="name"
                    type="text"
                    value={product.name}
                    onChange={handleChangeInput}
                    placeholder="Item"
                    hasIcon
                  />
                </div>
                <div ref={categoryRef} className="w-full relative">
                  <Tags className="absolute h-12 left-4 text-slate-300" />
                  <Input
                    name="category"
                    type="text"
                    value={product.category}
                    onChange={handleChangeInput}
                    onFocus={() => {
                      setCategoryFocus(true)
                    }}
                    placeholder="Category"
                    autoComplete="off"
                    hasIcon
                  />
                  {categoryFocus && filteredCategories.length > 0 && (
                    <ul className="absolute w-full bottom-14 p-4 text-slate-700 rounded-lg shadow-lg bg-white">
                      {filteredCategories.map((item) => {
                        return (
                          <li
                            key={item}
                            className="px-3 py-2 rounded-md cursor-pointer hover:bg-teal-500 hover:text-white"
                            onClick={() => {
                              setProduct({ ...product, category: item })
                              setCategoryFocus(false)
                            }}
                          >
                            {item}
                          </li>
                        )
                      })}
                    </ul>
                  )}
                </div>
                <Button width="w-full" disabled={loadingAdd}>
                  {loadingAdd ? (
                    <>
                      <RefreshCw size={22} className="animate-spin" />
                      Adding item...
                    </>
                  ) : (
                    <>
                      <PlusCircle />
                      Add item
                    </>
                  )}
                </Button>
              </form>
            </section>
          </>
        )}
      </main>
    </div>
  )
}
