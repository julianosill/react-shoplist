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
import Input from '../components/Input'
import { Button } from '../components/Button'
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
  X,
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
  const productRef = useRef<HTMLInputElement | null>(null)
  const categoryRef = useRef<HTMLInputElement | null>(null)

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
      productRef.current?.focus()
      return
    }
    if (!product.category) {
      setError('Category cannot be empty.')
      categoryRef.current?.focus()
      return
    }
    setLoadingAdd(true)
    await addDoc(collection(db, 'shoplist'), {
      name: product.name,
      category: product.category,
      created: new Date(),
    })
      .then(() => {
        loadList()
        setProduct({ name: '', category: '' })
        productRef.current?.focus()
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
      <main className="w-10/12 max-w-2xl min-h-screen mx-auto flex flex-col gap-2">
        <header
          className={`
            ${selectedItems.length > 0 && 'sticky top-0'}
            flex justify-between items-center py-3 border-b-2 border-slate-600 bg-slate-700
          `}
        >
          <img src={LogoH} alt="ShopList" className="w-36" />
          {selectedItems.length > 0 ? (
            <Button
              onClick={removeItems}
              size={'xs'}
              variant={'outlineDark'}
              disabled={loadingDel}
            >
              {loadingDel ? (
                <RefreshCw size={16} className="animate-spin" />
              ) : (
                <Trash2 size={16} />
              )}
            </Button>
          ) : (
            <Button
              onClick={logout}
              content="Log out"
              size={'xs'}
              variant={'outlineDark'}
              iconRight={() => <LogOut size={14} />}
            />
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
                        className="py-6 border-t-2 border-slate-600 first-of-type:border-none"
                      >
                        <h2 className="mb-2 flex items-center gap-2 text-xl text-teal-500">
                          <Tags
                            strokeWidth={1}
                            size={24}
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
                                  className={`px-3 flex justify-between items-center rounded-lg border-b last:border-0 border-slate-600/50 hover:bg-slate-800/50 
                                    ${isSelected && 'bg-slate-800/30'}
                                    ${isSelected && loadingDel && 'opacity-50'}
                                  `}
                                >
                                  <label
                                    htmlFor={item.id}
                                    className="flex-1 py-3 cursor-pointer"
                                  >
                                    {item.name}
                                  </label>
                                  <Checkbox.Root
                                    disabled={loadingDel}
                                    id={item.id}
                                    onClick={toggleSelectedItem}
                                    className="w-5 h-5 flex justify-center items-center border border-slate-500 rounded-md data-[state=checked]:border-teal-500"
                                  >
                                    <Checkbox.Indicator>
                                      <Check
                                        size={16}
                                        strokeWidth={2}
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

            <section className="mt-4 mb-8">
              <form onSubmit={addItem} className="flex flex-col gap-3">
                <Input
                  ref={productRef}
                  name="name"
                  type="text"
                  value={product.name}
                  onChange={handleChangeInput}
                  placeholder="Item"
                  icon={() => <ShoppingBasket size={22} />}
                  theme="dark"
                  dimension="sm"
                />
                <div className="w-full relative">
                  <Input
                    ref={categoryRef}
                    name="category"
                    type="text"
                    value={product.category}
                    onChange={handleChangeInput}
                    onFocus={() => {
                      setCategoryFocus(true)
                    }}
                    placeholder="Category"
                    icon={() => <Tags size={22} />}
                    autoComplete="off"
                    theme="dark"
                    dimension="sm"
                  />
                  {categoryFocus && filteredCategories.length > 0 && (
                    <ul className="absolute w-full bottom-12 p-3 text-white rounded-lg shadow-lg bg-slate-600">
                      <button
                        onClick={() => {
                          setCategoryFocus(false)
                        }}
                        className="absolute -right-2 -top-2 p-1 rounded-full bg-slate-500 hover:bg-teal-500"
                      >
                        <X size={14} />
                      </button>
                      {filteredCategories.map((item) => {
                        return (
                          <li
                            key={item}
                            className="px-3 py-2 rounded-md text-sm hover:bg-teal-500 cursor-pointer"
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
                <Button width="w-full" size="sm" disabled={loadingAdd}>
                  {loadingAdd ? (
                    <>
                      <RefreshCw size={18} className="animate-spin" />
                      Adding item...
                    </>
                  ) : (
                    <>
                      <PlusCircle size={20} />
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
