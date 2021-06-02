import React from 'react'
import clsx from 'clsx'
import styles from './HomepageFeatures.module.css'

const FeatureList = [
  {
    title: 'Easy to Use',
    Svg: require('../../static/img/undraw_docusaurus_mountain.svg').default,
    description: (
      <>
        Djorm's model API is quite intuitive to use without requiring to write
        lengthy and repeating SQL queries. It will help you increase speed of
        your app development.
      </>
    )
  },
  {
    title: 'Considerable fast',
    Svg: require('../../static/img/undraw_docusaurus_tree.svg').default,
    description: (
      <>
        Djorm was developed on low memory cloud functions. If you keep your code
        simple, it will deliver satisfying speed.
      </>
    )
  },
  {
    title: 'Low on deps',
    Svg: require('../../static/img/undraw_docusaurus_react.svg').default,
    description: <>Djorm keeps thin dependencies to make your code run fast.</>
  }
]

function Feature ({ Svg, title, description }) {
  return (
    <div className={clsx('col col--4')}>
      <div className='text--center'>
        <Svg className={styles.featureSvg} alt={title} />
      </div>
      <div className='text--center padding-horiz--md'>
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </div>
  )
}

export default function HomepageFeatures () {
  return (
    <section className={styles.features}>
      <div className='container'>
        <div className='row'>
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  )
}
