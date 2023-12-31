/// <reference types="cypress" />

import { addProduct } from '../../support/commands'
import { Given, When, Then } from 'cypress-cucumber-preprocessor/steps'
const { carrinhoPage } = require('../../support/page_objects')
const dados = require('../../fixtures/prodIntercept.json')
const dadosProdutos = require('../../fixtures/prodRequest.json')
let htmlEdit, htmlRemove

beforeEach(() => {
    cy.readFile("cypress/response/edit.html").then(edit=>{
      htmlEdit = edit
    })    
  })

beforeEach(() => {
    cy.readFile("cypress/response/remove.html").then(remove=>{
      htmlRemove = remove
    })    
  })


Given('I have added a product in the cart', () => {
    cy.addProduct(dadosProdutos.size, dadosProdutos.color, dadosProdutos.quantity,
        dadosProdutos.add_cart, dadosProdutos.product_id, dadosProdutos.variation_id)
})

When('I change the quantity of the product in the cart', () =>{
   cy.intercept({
        url: '/carrinho*',
        method: 'GET',                 
    }, req => {
        window.sessionStorage.setItem("wc_fragments_a84fb9b97c9e7516ea041e13a46d5c80", dados.edit)     
        req.reply(     
         {     
            statusCode: 200,     
            body: htmlEdit
         })     
       }).as('carrinhoGET') 

    cy.intercept({
        method: 'POST',
        url: '/?wc-ajax=get_refreshed_fragments*',         
    }, req => {
        if(req.headers.cookie.includes("woocommerce_items_in_cart=1")){
            req.reply({
                statusCode: 200,
                body: dados.edit
            })
        }        
    }).as('fragmentsEdit')

    carrinhoPage.addProduto()
})

When('I remove the product in the cart', () =>{
    cy.intercept({
         url: '/carrinho*',
         method: 'GET',                 
     }, req => {
         window.sessionStorage.setItem("wc_fragments_a84fb9b97c9e7516ea041e13a46d5c80", dados.remove)     
         req.reply(     
          {     
             statusCode: 200,     
             body: htmlRemove
          })     
        }).as('removeGET') 
 
     cy.intercept({
         method: 'POST',
         url: '/?wc-ajax=get_refreshed_fragments*',         
     }, req => {         
             req.reply({
                 statusCode: 200,
                 body: dados.remove
             })                 
     }).as('fragmentsRemove')
 
     carrinhoPage.addProduto()
 })

Then('I must see the product updated correctly', () =>{
    carrinhoPage.Total.should('contain', 'R$276,00')
})

Then('I must see the product removed correctly', () =>{
    carrinhoPage.carrinhoVazio.should('contain', 'Seu carrinho está vazio')
})