import { Injectable } from '@nestjs/common';
import { HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class ItemsService {
  private readonly apiUrl = 'http://python_api:5000/items';
  // private readonly apiUrl = 'http://localhost:5001/items';

  async findAll() {
    try {
      const response = await axios.get(this.apiUrl);
      
      // test: add to response fom python-api
      response.data.push({ name: 'test', description: 'test' });
      
      return response.data;
    } catch (error) {
      throw new HttpException(`ERROR: ${error}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async create(createItemDto: { name: string; description?: string }) {
    try {
      const response = await axios.post(this.apiUrl, createItemDto);
      return response.data;
    } catch (error) {
      throw new HttpException('Failed to create item', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}