import { ChangeEvent, FormEvent, MouseEvent, useEffect, useState } from 'react'
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

import { Button } from '../components/Button'
import { Input } from '../components/Input'
import * as Checkbox from '@radix-ui/react-checkbox'
import * as Select from '@radix-ui/react-select'
import * as Dialog from '@radix-ui/react-dialog'

import {
  Check,
  ChevronsUpDown,
  PlusCircle,
  RefreshCw,
  ShoppingBasket,
  Tag,
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
  const [list, setList] = useState<Product[] | null>(null)
  const [categories, setCategories] = useState<string[]>([])
  const [loadingList, setLoadingList] = useState(true)
  const [loadingAdd, setLoadingAdd] = useState(false)
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [openDialog, setOpenDialog] = useState(false)
  const [product, setProduct] = useState({
    name: '',
    category: '',
  })

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

  const addCategory = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    e.stopPropagation()
    const data = Object.fromEntries(new FormData(e.currentTarget))
    const newCategory = data.category.toString()
    const hasCategory = categories.includes(newCategory)
    if (hasCategory) {
      console.log('Category already exist.')
      return
    }
    setCategories([...categories, newCategory])
    setOpenDialog(false)
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

  const handleCategorySelected = (category: string) => {
    setProduct({ ...product, category })
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
        setProduct({ ...product, name: '' })
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

  useEffect(() => {
    loadList()
  }, [])

  // console.log('Rendering...')

  return (
    <div className="w-full min-h-screen py-6 bg-slate-700">
      <main className="w-10/12 max-w-2xl mx-auto">
        {loadingList ? (
          <div className="py-10 flex flex-col items-center gap-4">
            <RefreshCw size={64} className="text-slate-500 animate-spin" />
            <h2 className="text-xl text-slate-100 animate-pulse">
              Loading your list...
            </h2>
          </div>
        ) : (
          <section className="relative">
            {selectedItems.length > 0 && (
              <button
                onClick={removeItems}
                className="absolute top-0 right-0 p-1.5 border-2 border-slate-400 text-slate-400 rounded-md hover:bg-teal-500 hover:text-white hover:border-teal-500"
              >
                <Trash2 size={22} />
              </button>
            )}
            {categories.map((cat) => {
              const hasItems = list?.some((item) => item.category === cat)
              if (hasItems)
                return (
                  <div
                    key={cat}
                    className="pt-8 pb-4 border-t-2 border-slate-600 first-of-type:border-none"
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

            <section className="sticky bottom-6 p-10 mt-12 rounded-xl bg-white">
              <form onSubmit={addItem} className="flex flex-col gap-4">
                <div className="w-full relative">
                  <ShoppingBasket className="absolute h-12 left-4 text-slate-300" />
                  <Input
                    name="name"
                    type="text"
                    value={product?.name}
                    onChange={handleChangeInput}
                    placeholder="Item"
                    hasIcon={true}
                  />
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <Select.Root onValueChange={handleCategorySelected}>
                      <Select.Trigger
                        className="w-full h-12 px-3 flex items-center justify-between border-2 border-slate-200 rounded-md text-slate-700 bg-slate-100 hover:bg-slate-50 focus:bg-slate-50 outline-teal-500"
                        aria-label="Category"
                      >
                        <Select.Value placeholder="Select a category" />
                        <Select.Icon>
                          <ChevronsUpDown size={18} />
                        </Select.Icon>
                      </Select.Trigger>

                      <Select.Portal>
                        <Select.Content className="p-4 rounded-lg bg-white shadow-xl">
                          <Select.Viewport>
                            {categories &&
                              categories.map((cat) => {
                                return (
                                  <Select.Item
                                    key={cat}
                                    value={cat}
                                    className="px-3 py-2 rounded-md flex justify-between outline-teal-500 cursor-pointer text-slate-700 hover:text-white hover:bg-teal-500 focus:bg-teal-500 focus:text-white"
                                  >
                                    <Select.ItemText>{cat}</Select.ItemText>
                                    <Select.ItemIndicator>
                                      <Check />
                                    </Select.ItemIndicator>
                                  </Select.Item>
                                )
                              })}
                          </Select.Viewport>
                          <Select.Arrow />
                        </Select.Content>
                      </Select.Portal>
                    </Select.Root>
                  </div>

                  <Dialog.Root open={openDialog} onOpenChange={setOpenDialog}>
                    <Dialog.Trigger>
                      <Button anchor={true} variant="outline" width="w-fit">
                        <Tag size={21} />
                        Add category
                      </Button>
                    </Dialog.Trigger>
                    <Dialog.Portal>
                      <Dialog.Overlay className="bg-slate-800/80 fixed inset-0" />
                      <Dialog.Content className="fixed top-[50%] left-[50%] max-h-[85vh] w-10/12 max-w-2xl translate-x-[-50%] translate-y-[-50%] p-10 rounded-lg bg-white shadow-xl shadow-slate-700 focus:outline-none group">
                        <Dialog.Title className="mb-6 text-2xl text-slate-700">
                          Add new category
                        </Dialog.Title>
                        <Dialog.Close className="absolute top-4 right-4 p-1 rounded-full text-slate-300 group-hover:text-slate-500 hover:bg-slate-200">
                          <X />
                        </Dialog.Close>

                        <form onSubmit={addCategory} className="flex gap-4">
                          <Input
                            type="text"
                            name="category"
                            placeholder="Category name"
                          />
                          <Button width="w-fit">
                            <Tag size={21} />
                            Add
                          </Button>
                        </form>
                      </Dialog.Content>
                    </Dialog.Portal>
                  </Dialog.Root>
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
          </section>
        )}
      </main>
    </div>
  )
}
