'use strict';
var stream = Rx.Observable;

const first = stream.just(container => container.append('h1').text('helloooo world'))

const tabs = [
  {
    label: 'Load',
    id: 'load',
    active: true
  },
  {
    label: 'Visualize',
    id: 'viz',
  }
]

const initialState = {
  tabs: [
    {
      label: 'Load',
      id: 'load',
      active: true,
      description: 'Load and select index cards',
      columns: [
        {
          label: 'Database Statistics',
          id: 'db-stats',
          content: ['Loading...']
        },
        {
          label: 'Something Else',
          id: 'temp',
          content: ['Whatever']
        }
      ]
    },
    {
      label: 'Visualize',
      id: 'viz',
      columns: []
    }
  ]
}

function enterTabs(main) {
  main.append('ul').classed('nav nav-tabs', true)
    .selectAll('li').data(d => d.tabs)
    .enter()
    .append('li').classed('nav-item', true)
    .append('a').classed('nav-link', true)
    .classed('active', d => d.active)
    .attr('data-toggle', 'tab')
    .text(d => d.label)
    .attr('href', d => `#${d.id}`)

  let tab = main.append('div').classed('tab-content', true)
    .selectAll('.tab-pane').data(d => d.tabs)
    .enter()
    .append('div').classed('tab-pane fade', true)
    .classed('active in', d => d.active)
    .attr('id', d => d.id)

  tab.append('div').classed('row header', true)
    // .text(d => `Default text for the ${d.label} tab.`)

  tab.append('div').classed('row content', true)
    // .text('Content')
}

function view(state$) {
  return state$.map(state => container => {
    console.log(state)
    // container.append('h1').text('MITRE REACH FRIES Index Cards')

    let row = container.selectAll('.row').data([initialState])

    row.enter().append('div').classed('row', true)
      .append('div').classed('col-xs-12', true)
      .append('main')
      .each(function() { enterTabs(d3.select(this)) })

    let columns = row.selectAll('.tab-pane')
      .select('.content')
      .selectAll('.column').data(d => d.columns)

    columns.enter().append('div')
      .attr('id', d => d.id)
      .classed('col-md-4 column', true)
      .append('div').classed('card',true)
      .each(function() {
        let card = d3.select(this)
        card
          .append('h4')
          .classed('card-header', true)
          .text(d => d.label)
        card
          .append('div')
          .classed('card-block', true)
      })

    let dbStats = columns
      .filter('#db-stats')
      .select('.card-block')
      .selectAll('pre')
      .data(d => d.content)

    dbStats.enter().append('pre')

    dbStats.text(state.dbStats)

    return container
  })
}

function main(sources) {

  const dbStats$ = sources.HTTP
    .filter(o => o.url === '/db/stats')
    .map(o => JSON.stringify(o.response, null, 2))
    .startWith("Loading...")

  const state$ = dbStats$.map(dbStats => ({ dbStats }))

  const getDbStats$ = stream.just({
    url: '/db/stats',
    method: 'GET'
  })

  const sinks = {
    DOM$: view(state$),
    HTTP: getDbStats$
  }

  return sinks
}

const sinkProxies = {
  DOM$: new Rx.ReplaySubject(1),
  HTTP: new Rx.ReplaySubject(1)
}

function httpDriver(outgoing$) {
  return outgoing$
    .flatMap(o =>
      stream
        .fromNodeCallback(d3.requestJson)(o.url)
        .map(data => {
          o.response = data
          return o
        })
    )
}

const sources = {
  DOM$: sinkProxies.DOM$.scan((o,fn) => fn(o), d3.select('#app')),
  HTTP: httpDriver(sinkProxies.HTTP)
}

sources.DOM$.subscribe()

const sinks = main(sources)

sinks.DOM$.subscribe(sinkProxies.DOM$.asObserver())
sinks.HTTP.subscribe(sinkProxies.HTTP.asObserver())
