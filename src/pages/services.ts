import axios from 'axios'
import type { AxiosResponse } from 'axios'


export interface TestModel {
  id: string
  name: string
  age: number
}

const httpClient = axios.create({
  baseURL: 'https://dahua.metcfire.com.tw/api'
})

// 【GET】https://dahua.metcfire.com.tw/api/CRUDTest/a
export const fetchTest = () => httpClient.get('/CRUDTest/a') as Promise<AxiosResponse<TestModel[]>>
export const createTest = (body: unknown) => httpClient.post('/CRUDTest', body) as Promise<AxiosResponse<unknown>>
export const updateTest = (body: unknown) => httpClient.patch('/CRUDTest', body) as Promise<AxiosResponse<unknown>>
export const deleteTest = (id: string) => httpClient.delete('/CRUDTest/' + id,) as Promise<AxiosResponse<unknown>>
