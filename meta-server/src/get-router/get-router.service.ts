import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { readFileSync } from 'fs';
import { join } from 'path';
import { CacheService } from 'src/cache/cache.service';
import configuration from 'src/config/configuration';

@Injectable()
export class GetRouterService implements OnModuleInit {
  constructor(private cacheService: CacheService) {}
  private breakPointInfo: any;
  private logger: Logger = new Logger('GetRouterService');
  // private configService: ConfigService;

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  async onModuleInit() {
    // const app_id = this.configService.get('app.appId');
    // const prefix = this.configService.get('app.prefix');
    const app_id = configuration().app.appId;
    const prefix = configuration().app.prefix;

    // const app_id = '0000000005';
    // const prefix = '/mnt/metaverse/scene';
    console.log('app_id', app_id, configuration().app.appId);
    console.log('prefix', prefix, configuration().app.appId);
    let path;
    // let path: string;
    if (process.env.NODE_ENV === 'development') {
      path = join(__dirname, `../ws/${app_id}/points-${app_id}.json`);
      console.log('测试服JSON-router', path);
    }
    if (process.env.NODE_ENV === 'production') {
      path = join(`${prefix}/${app_id}/points-${app_id}.json`);
      console.log('正式服JSON-router', path);
    }
    this.loadJSON(path);
  }

  async loadJSON(path) {
    try {
      const data = await readFileSync(path);
      const BreakPointInfo = JSON.parse(Buffer.from(data).toString('utf-8'));
      this.breakPointInfo = BreakPointInfo;
      // console.log('BreakPointInfo', BreakPointInfo);
    } catch (error) {
      this.logger.error('load-json-error', error);
    }
  }

  searchRoad(appId, startPointId, clicking_point) {
    try {
      console.log('进入2 - searchRoad');
      //表示终点
      let endPoint;
      //const keys = this.cacheService.keys(`breakpoints:app_id:${appId}*`);
      let minDis = null;
      //for (let i = 0; i < keys.length; ++i) {
      for (const key in this.breakPointInfo) {
        //const breakPointRes = await this.cacheService.get(keys[i]);
        //const breakPoint = JSON.parse(breakPointRes);
        // if (Number(key) == startPointId) {
        //   continue;
        // }
        //const position = breakPoint.position;
        const breakPoint = this.breakPointInfo[key];
        if (minDis == null) {
          minDis = this.getDistance(clicking_point, breakPoint.position);
          endPoint = breakPoint;
          endPoint.breakPointId = Number(key);
        } else if (
          minDis > this.getDistance(clicking_point, breakPoint.position)
        ) {
          endPoint = breakPoint;
          minDis = this.getDistance(clicking_point, breakPoint.position);
          endPoint.breakPointId = Number(key);
        }
      }

      if (minDis > 100) {
        return null;
      }

      if (startPointId == endPoint.breakPointId) {
        console.log('点击的点和当前点是同一个点');
        return null;
      }

      // const startPointRes = await this.cacheService.get(
      //   'breakpoints:app_id:' + appId + ':break_point_id:' + startPointId,
      // );
      // const startPoint = JSON.parse(startPointRes);
      const startPoint = this.breakPointInfo[startPointId];
      if (startPoint.contact.indexOf(endPoint.breakPointId) > -1) {
        // debugger;
        return [startPointId, endPoint.breakPointId];
      }
      // const endPointRes = await this.cacheService.get(
      //   'breakpoints:app_id:' + appId + ':break_point_id:' + endPointId,
      // );
      // const endPoint = JSON.parse(endPointRes);

      const openList = [], //开启列表
        closeList = []; //关闭列表
      let result = []; //结果数组
      let result_index: number; //结果数组在开启列表中的序号

      //openList.push({x:startPoint.x,y:startPoint.y,G:0});//把当前点加入到开启列表中，并且G是0
      openList.push({
        breakPointId: startPointId,
        G: 0,
        position: startPoint.position,
        contact: startPoint.contact,
      }); //把当前点加入到开启列表中，并且G是0

      do {
        const currentPoint = openList.pop();
        // const currentPointId = currentPointInfo.breakPointId;
        // const currentPoint = {
        //   breakPointId: currentPointInfo.breakPointId,
        //   position: this.breakPointInfo[currentPointId].position,
        //   contact:this.breakPointInfo[currentPointId].contact,
        //   G: currentPointInfo.G,
        // };
        closeList.push(currentPoint);
        if (closeList.length > 10000) {
          console.log('错误过渡路径：', closeList.length);
          return null;
        }
        //读redis里的数据
        // const breakPointRes = await this.cacheService.get(
        //   'breakpoints:app_id:' +
        //     appId +
        //     ':break_point_id:' +
        //     currentPointInfo.breakPointId,
        // );
        let surroundPoint = [];
        //const _breakPoint = JSON.parse(breakPointRes);
        const _breakPoint = this.breakPointInfo[currentPoint.breakPointId];
        surroundPoint = _breakPoint.contact;
        for (let i = 0; i < surroundPoint.length; ++i) {
          const neighPointId = surroundPoint[i];
          // const itemRes = await this.cacheService.get(
          //   'breakpoints:app_id:' + appId + ':break_point_id:' + neighPointId,
          // );
          // const item = JSON.parse(itemRes);
          const item = this.breakPointInfo[neighPointId];
          if (this.existList(item, closeList) != -1) {
            continue;
          }
          item.breakPointId = neighPointId;
          //g 到父节点的位置
          const g =
            currentPoint.G +
            this.getDistance(currentPoint.position, item.position);
          if (this.existList(item, openList) == -1) {
            //如果不在开启列表中
            item['H'] = this.getDistance(endPoint.position, item.position);
            item['G'] = g;
            item['F'] = item.H + item.G;
            item['parent'] = currentPoint;
            openList.push(item);
          } else {
            //存在在开启列表中，比较目前的g值和之前的g的大小
            const index = this.existList(item, openList);
            //如果当前点的g更小
            if (g < openList[index].G) {
              openList[index].parent = currentPoint;
              openList[index].G = g;
              openList[index].F = g + openList[index].H;
            }
          }
        }
        //如果开启列表空了，没有通路，结果为空
        if (openList.length == 0) {
          break;
        }

        openList.sort(this.sortF); //这一步是为了循环回去的时候，找出 F 值最小的, 将它从 "开启列表" 中移掉
      } while ((result_index = this.existList(endPoint, openList)) == -1);

      //判断结果列表是否为空
      let currentObj;
      if (result_index == -1) {
        result = [];
      } else {
        currentObj = openList[result_index];
        do {
          //把路劲节点添加到result当中
          result.unshift(currentObj.breakPointId);
          currentObj = currentObj.parent;
          if (!currentObj) {
            break;
          }
        } while (
          //currentObj.position.x != startPoint.position.x ||
          //currentObj.position.y != startPoint.position.y
          result.length < 50 &&
          currentObj.contact.indexOf(startPointId) < 0
        );
      }
      if (result.length > 30) {
        console.log('错误过渡路径：' + result);
        // debugger;
        return null;
      }
      result.unshift(currentObj.breakPointId);
      result.unshift(startPointId);
      console.log('path-end' + result);
      // debugger;
      return result;
    } catch (error) {
      console.error('searchRoad', error);
      return [];
    }
  }


  searchRoad2(startPointId, endPointId) {
    try {
      if (startPointId == endPointId) {
        console.log('点击的点和当前点是同一个点');
        return null;
      }

      const startPoint = this.breakPointInfo[startPointId];
      if (startPoint.contact.indexOf(endPointId) > -1) {
        return [startPointId, endPointId];
      }

      const endPoint = this.breakPointInfo[endPointId];
      const openList = [], //开启列表
        closeList = []; //关闭列表
      let result = []; //结果数组
      let result_index: number; //结果数组在开启列表中的序号

      //把当前点加入到开启列表中，并且G是0
      openList.push({
        breakPointId: startPointId,
        G: 0,
        position: startPoint.position,
        contact: startPoint.contact,
      }); //把当前点加入到开启列表中，并且G是0

      do {
        const currentPoint = openList.pop();
        closeList.push(currentPoint);
        if (closeList.length > 10000) {
          console.log('错误过渡路径：', closeList.length);
          return null;
        }
        let surroundPoint = [];
        const _breakPoint = this.breakPointInfo[currentPoint.breakPointId];
        surroundPoint = _breakPoint.contact;
        for (let i = 0; i < surroundPoint.length; ++i) {
          const neighPointId = surroundPoint[i];
          const item = this.breakPointInfo[neighPointId];
          if (this.existList(item, closeList) != -1) {
            continue;
          }
          item.breakPointId = neighPointId;
          //g 到父节点的位置
          const g =
            currentPoint.G +
            this.getDistance(currentPoint.position, item.position);
          if (this.existList(item, openList) == -1) {
            //如果不在开启列表中
            item['H'] = this.getDistance(endPoint.position, item.position);
            item['G'] = g;
            item['F'] = item.H + item.G;
            item['parent'] = currentPoint;
            openList.push(item);
          } else {
            //存在在开启列表中，比较目前的g值和之前的g的大小
            const index = this.existList(item, openList);
            //如果当前点的g更小
            if (g < openList[index].G) {
              openList[index].parent = currentPoint;
              openList[index].G = g;
              openList[index].F = g + openList[index].H;
            }
          }
        }
        //如果开启列表空了，没有通路，结果为空
        if (openList.length == 0) {
          break;
        }

        openList.sort(this.sortF); //这一步是为了循环回去的时候，找出 F 值最小的, 将它从 "开启列表" 中移掉
      } while ((result_index = this.existList(endPoint, openList)) == -1);

      //判断结果列表是否为空
      let currentObj;
      if (result_index == -1) {
        result = [];
      } else {
        currentObj = openList[result_index];
        do {
          //把路劲节点添加到result当中
          result.unshift(currentObj.breakPointId);
          currentObj = currentObj.parent;
          if (!currentObj) {
            break;
          }
        } while (
          result.length < 50 &&
          currentObj.contact.indexOf(startPointId) < 0
        );
      }
      if (result.length > 50) {
        console.log('错误过渡路径：' + result);
        // debugger;
        return null;
      }
      result.unshift(currentObj.breakPointId);
      result.unshift(startPointId);
      console.log('path-end' + result);
      return result;
    } catch (error) {
      console.error('searchRoad', error);
      return [];
    }
  }

  //用F值对数组排序
  sortF(a, b) {
    return b.F - a.F;
  }

  //获取周围点
  async SurroundPoint(appId, curPointId, endPoint) {
    //读redis里的数据
    const breakPointRes = await this.cacheService.get(
      'breakpoints:app_id:' + appId + ':break_point_id:' + curPointId,
    );
    const breakPoint = JSON.parse(breakPointRes);
    if (this.getDistance(breakPoint.position, endPoint.position) < 1) {
      breakPoint.contact.push(endPoint.breakPointId);
    }
    return breakPoint.contact;
  }

  //判断点是否存在在列表中，是的话返回的是序列号
  existList(point, list) {
    for (let i = 0; i < list.length; ++i) {
      if (point.breakPointId == list[i].breakPointId) {
        return i;
      }
    }
    return -1;
  }

  getDistance(position1, position2) {
    return Math.sqrt(
      (position1.x - position2.x) * (position1.x - position2.x) +
        (position1.y - position2.y) * (position1.y - position2.y),
    );
  }
}
