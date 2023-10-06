import {
  ChangeEvent,
  FormEvent,
  MouseEvent,
  useContext,
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
import { AuthContext } from '../contexts/auth'

import LogoH from '../assets/logo-h.svg'
import { Button } from '../components/Button'
import { Input } from '../components/Input'
import { ErrorMessage } from '../components/ErrorMessage'
import * as Checkbox from '@radix-ui/react-checkbox'

import {
  Check,
  LayoutList,
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
  const { logout } = useContext(AuthContext)
  const [list, setList] = useState<Product[] | null>(null)
  const [categories, setCategories] = useState<string[]>([])
  const [loadingList, setLoadingList] = useState(true)
  const [loadingAdd, setLoadingAdd] = useState(false)
  const [loadingDel, setLoadingDel] = useState(false)
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [categoryFocus, setCategoryFocus] = useState(false)
  const [error, setError] = useState('')
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
    const productsRef = collection(db, 'shoplist')
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
    setError('')
    if (!product.name) {
      setError('Item cannot be empty.')
      return
    }
    if (!product.category) {
      setError('Category cannot be empty.')
      return
    }
    setLoadingAdd(true)
    await addDoc(collection(db, 'shoplist'), {
      name: product.name,
      category: product.category,
      created: new Date(),
    })
      .then(() => {
        setProduct({ name: '', category: '' })
        loadList()
      })
      .catch((error) => {
        console.log(error)
        setError(error.code)
      })
      .finally(() => setLoadingAdd(false))
  }

  async function removeItems() {
    setLoadingDel(true)
    try {
      const removeSelectedItems = selectedItems.map((docId) => {
        return deleteDoc(doc(db, 'shoplist', docId))
      })
      await Promise.all(removeSelectedItems)
        .then(() => {
          loadList()
          setSelectedItems([])
          setLoadingDel(false)
        })
        .catch((error) => console.log(error))
    } catch (error) {
      console.log(error)
    }
  }

  const handleClick = (e: MouseEvent) => {
    const target = e.target as Node
    if (!categoryRef.current?.contains(target)) {
      setCategoryFocus(false)
    }
  }

  useEffect(() => {
    loadList()
  }, [])

  return (
    <div className="w-full min-h-screen bg-slate-700" onClick={handleClick}>
      <main className="w-10/12 max-w-2xl min-h-screen mx-auto flex flex-col gap-4">
        <header className="sticky top-0 flex justify-between items-center py-4 border-b-2 border-slate-600 bg-slate-700">
          <img src={LogoH} alt="ShopList" className="w-40" />
          {selectedItems.length > 0 ? (
            <button
              onClick={removeItems}
              className={`w-8 h-8 flex justify-center items-center border-2 border-slate-400 text-slate-400 rounded-md hover:bg-teal-500 hover:text-white hover:border-teal-500 ${
                loadingDel && 'opacity-50'
              }`}
              disabled={loadingDel}
            >
              {loadingDel ? (
                <RefreshCw size={20} className="animate-spin" />
              ) : (
                <Trash2 size={20} />
              )}
            </button>
          ) : (
            <div>
              <button
                onClick={logout}
                className="h-8 px-2 flex justify-center items-center gap-1 text-sm border border-slate-400 text-slate-400 rounded-md hover:text-teal-500 hover:border-teal-500"
              >
                Log out <LogOut size={18} />
              </button>
            </div>
          )}
        </header>
        {loadingList ? (
          <div className="py-10 flex-1 flex flex-col items-center justify-center gap-4">
            <RefreshCw size={64} className="text-slate-500 animate-spin" />
            <p className="text-lg text-slate-100 animate-pulse">
              Loading your list...
            </p>
          </div>
        ) : (
          <>
            {list && list.length === 0 ? (
              <div className="flex-1 flex flex-col justify-center items-center">
                <LayoutList size={64} className="text-slate-500" />
                <p className="mt-4 text-lg text-slate-100">
                  There are no products in this list.
                </p>
                <p className="text text-slate-400">
                  Please, add some items below.
                </p>
              </div>
            ) : (
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
                          {list?.map((item) => {
                            if (item.category === cat) {
                              const isSelected = selectedItems.includes(item.id)
                              return (
                                <li
                                  key={item.id}
                                  className={`px-4 flex justify-between items-center rounded-lg border-b last:border-0 border-slate-600/50 hover:bg-slate-800/50 
                                    ${isSelected && 'bg-slate-800/30'}
                                    ${isSelected && loadingDel && 'opacity-50'}
                                  `}
                                >
                                  <label
                                    htmlFor={item.id}
                                    className="flex-1 py-4 cursor-pointer"
                                  >
                                    {item.name}
                                  </label>
                                  <Checkbox.Root
                                    disabled={loadingDel}
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
            )}

            <section className="mb-8 p-10 rounded-xl bg-white">
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
                {error && <ErrorMessage message={error} warning={true} />}
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
