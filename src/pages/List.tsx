import { ChangeEvent, FormEvent, MouseEvent, useEffect, useState } from 'react'
import { db } from '../services/firebaseConnection'
import { collection, doc, getDocs, addDoc, deleteDoc } from 'firebase/firestore'

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
} from 'lucide-react'

interface Product {
  id?: string
  name?: string
  category?: string
  created?: Date
}

export default function List() {
  const [list, setList] = useState<Product[] | null>(null)
  const [categories, setCategories] = useState<string[]>([])
  const [loadingList, setLoadingList] = useState(true)
  const [loadingAdd, setLoadingAdd] = useState(false)
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [product, setProduct] = useState<Product | null>({
    name: '',
    category: '',
  })

  async function loadList() {
    const productsRef = collection(db, 'market')
    await getDocs(productsRef)
      .then((snapshot) => {
        const items: object[] = []
        snapshot.forEach((doc) => {
          items.push({
            id: doc.id,
            name: doc.data().name,
            category: doc.data().category,
            created: doc.data().created,
          })
        })
        setList(items)
        getCategories()
      })
      .catch((error) => console.log(error))
      .finally(() => setLoadingList(false))
  }

  function getCategories() {
    const cat: string[] = []
    list?.forEach((item) => {
      const hasCategory = cat.includes(item.category)
      if (!hasCategory) {
        cat.push(item.category)
      }
    })
    setCategories(cat)
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

  const addCategory = () => {
    const newCategoryList = categories
    newCategoryList.push('Test')
    setCategories([...newCategoryList])
  }

  async function addItem(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!product?.category) {
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

  useEffect(() => {
    loadList()
  }, [])

  // console.log('Rendering...')

  return (
    <main className="w-full min-h-screen py-6 bg-slate-700">
      <div className="w-10/12 max-w-2xl mx-auto">
        {loadingList ? (
          <div className="py-10 flex flex-col items-center gap-4">
            <RefreshCw size={64} className="text-slate-500 animate-spin" />
            <h2 className="text-xl text-slate-100 animate-pulse">
              Loading your list...
            </h2>
          </div>
        ) : (
          <>
            {categories &&
              categories.map((cat) => {
                return (
                  <section
                    key={cat}
                    className="pt-8 pb-4 border-t-2 border-slate-600 first:border-none"
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
                  </section>
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

                  <Dialog.Root>
                    <Dialog.Trigger>
                      <Button anchor={true} variant="outline" width="w-fit">
                        <Tag size={21} />
                        Add category
                      </Button>
                    </Dialog.Trigger>
                    <Dialog.Portal>
                      <Dialog.Overlay className="bg-slate-800/80 fixed inset-0" />
                      <Dialog.Content className="fixed top-[50%] left-[50%] max-h-[85vh] w-10/12 max-w-2xl translate-x-[-50%] translate-y-[-50%] p-10 rounded-lg bg-white shadow-xl shadow-slate-700 focus:outline-none">
                        <Dialog.Title className="mb-6 text-2xl text-slate-700">
                          Add new category
                        </Dialog.Title>

                        <form onSubmit={addCategory} className="flex gap-4">
                          <Input
                            name="category"
                            type="text"
                            placeholder="Category"
                          />
                          <Dialog.Close asChild>
                            <Button width="w-fit">
                              <Tag size={21} />
                              Add
                            </Button>
                          </Dialog.Close>
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
          </>
        )}
      </div>
    </main>
  )
}
